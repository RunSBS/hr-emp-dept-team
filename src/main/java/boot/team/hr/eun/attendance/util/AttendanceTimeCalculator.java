package boot.team.hr.eun.attendance.util;

import boot.team.hr.eun.attendance.entity.AttendancePolicy;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * WORK_RECORD의 minutes 컬럼 계산을 담당.
 *
 * 규칙(요약)
 * - 정상 근무(정책): startTime ~ overtimeStart (휴게시간 제외)
 * - 출근을 더 일찍 눌러도(예: 07:00) 정상근무 분은 startTime부터만 카운트
 * - 퇴근을 늦게 눌렀으면 overtimeStart 이후는 OVERTIME_WORK_MINUTES로 누적
 * - 휴게시간(breakStart~breakEnd)은 NORMAL/UNPAID 계산에서 제외
 *
 * - AM 반차(오전 반차): 일과 '절반 경계' 시각부터 늦으면 지각(그 전은 일찍 눌러도 OK)
 * - PM 반차(오후 반차): 일과 '절반 경계' 시각만 넘으면 언제 퇴근 눌러도 정상(단, 다음날은 기존 자동퇴근 로직이 커버)
 */
public class AttendanceTimeCalculator {

    public static WorkTimeResult calculateAsNormalFullDay(AttendancePolicy policy) {
        int scheduled = scheduledWorkMinutes(policy); // 이미 휴게시간 제외됨
        return new WorkTimeResult(scheduled, 0, 0, scheduled);
    }
    public record WorkTimeResult(
            int normalWorkMinutes,
            int overtimeWorkMinutes,
            int unpaidMinutes,
            int totalWorkMinutes
    ) {}

    /**
     * 전일 결근: unpaid = 정책 정상근무 분
     */
    public static WorkTimeResult calculateAbsent(AttendancePolicy policy) {
        int scheduledWork = scheduledWorkMinutes(policy);
        return new WorkTimeResult(0, 0, scheduledWork, 0);
    }

    /**
     * 반차(AM/PM)인데도 출근 기록이 없어서 결근 처리하는 경우:
     * '일과 절반'만 무급 처리.
     */
    public static WorkTimeResult calculateHalfDayAbsent(AttendancePolicy policy) {
        int half = scheduledWorkMinutes(policy) / 2;
        return new WorkTimeResult(0, 0, half, 0);
    }

    /**
     * 일반(전일) 근무 정산:
     * - normal: start~overtimeStart 내 실제 근무(휴게 제외)
     * - unpaid: (정책 정상근무분) - normal
     * - overtime: overtimeStart 이후
     */
    public static WorkTimeResult calculateAtCheckOut(
            LocalDateTime checkIn,
            LocalDateTime checkOut,
            AttendancePolicy policy
    ) {
        LocalDate workDate = checkIn.toLocalDate();
        LocalDateTime scheduledStart = buildPolicyDateTime(workDate, policy.getStartTime());
        LocalDateTime scheduledEnd = buildPolicyDateTime(workDate, policy.getOvertimeStart());
        return calculateAtCheckOutWindow(checkIn, checkOut, policy, scheduledStart, scheduledEnd);
    }

    /**
     * 반차(AM/PM) 근무 정산:
     * - AM 반차: expectedStart=halfBoundary, expectedEnd=overtimeStart
     * - PM 반차: expectedStart=startTime, expectedEnd=halfBoundary
     */
    public static WorkTimeResult calculateAtCheckOutHalfDay(
            LocalDateTime checkIn,
            LocalDateTime checkOut,
            AttendancePolicy policy,
            LocalDateTime expectedStart,
            LocalDateTime expectedEnd
    ) {
        return calculateAtCheckOutWindow(checkIn, checkOut, policy, expectedStart, expectedEnd);
    }

    /**
     * 정책 정상근무 구간(= windowStart~windowEnd) 안에서의 근무/무급을 계산하고,
     * overtimeStart 이후는 overtime으로 따로 누적한다.
     */
    private static WorkTimeResult calculateAtCheckOutWindow(
            LocalDateTime checkIn,
            LocalDateTime checkOut,
            AttendancePolicy policy,
            LocalDateTime windowStart,
            LocalDateTime windowEnd
    ) {
        if (checkOut.isBefore(checkIn)) {
            throw new IllegalArgumentException("퇴근 시간이 출근 시간보다 빠릅니다.");
        }

        LocalDate workDate = windowStart.toLocalDate();
        LocalDateTime overtimeStartDt = buildPolicyDateTime(workDate, policy.getOvertimeStart());

        // 정상근무 계산은 windowEnd까지로 캡
        LocalDateTime normalEndCap = checkOut.isBefore(windowEnd) ? checkOut : windowEnd;

        // 출근을 일찍 눌러도 windowStart 이전은 인정하지 않음
        LocalDateTime normalStart = checkIn.isAfter(windowStart) ? checkIn : windowStart;

        int normal = 0;
        if (normalEndCap.isAfter(normalStart)) {
            normal = minutesExcludingBreak(
                    normalStart,
                    normalEndCap,
                    buildPolicyDateTime(workDate, policy.getBreakStart()),
                    buildPolicyDateTime(workDate, policy.getBreakEnd())
            );
        }

        int scheduled = minutesExcludingBreak(
                windowStart,
                windowEnd,
                buildPolicyDateTime(workDate, policy.getBreakStart()),
                buildPolicyDateTime(workDate, policy.getBreakEnd())
        );

        int unpaid = Math.max(0, scheduled - normal);

        // overtime: overtimeStart 이후(정책 기준)
        int overtime = 0;
        if (checkOut.isAfter(overtimeStartDt)) {
            overtime = (int) Duration.between(overtimeStartDt, checkOut).toMinutes();
        }

        int total = normal + overtime;
        return new WorkTimeResult(normal, overtime, unpaid, total);
    }

    /**
     * 일과(휴게 제외) 누적 분 기준으로 '절반 경계 시각'을 계산한다.
     * 예: 09:00~18:00, break 12~13 => 정상근무 480분, 절반 240분 => 경계 14:00
     */
    public static LocalDateTime getHalfDayBoundaryDateTime(LocalDate workDate, AttendancePolicy policy) {
        int halfWork = scheduledWorkMinutes(policy) / 2;

        LocalDateTime start = buildPolicyDateTime(workDate, policy.getStartTime());
        LocalDateTime end = buildPolicyDateTime(workDate, policy.getOvertimeStart());
        LocalDateTime breakStart = buildPolicyDateTime(workDate, policy.getBreakStart());
        LocalDateTime breakEnd = buildPolicyDateTime(workDate, policy.getBreakEnd());

        LocalDateTime cursor = start;
        int accumulated = 0;

        while (cursor.isBefore(end)) {
            // 다음 1분
            LocalDateTime next = cursor.plusMinutes(1);

            // break면 누적 안 함
            boolean inBreak = overlaps(cursor, next, breakStart, breakEnd);
            if (!inBreak) {
                accumulated++;
                if (accumulated >= halfWork) {
                    return next; // 이 시각부터 오후 근무 시작(AM 반차) / 이 시각까지 오전 근무 종료(PM 반차)
                }
            }
            cursor = next;
        }
        return end;
    }

    /**
     * 정책 정상근무 분(휴게 제외)
     */
    public static int scheduledWorkMinutes(AttendancePolicy policy) {
        LocalTime start = policy.getStartLocalTime();
        LocalTime overtime = policy.getOvertimeStartLocalTime();
        long raw = Duration.between(start, overtime).toMinutes();

        LocalTime bS = policy.getBreakStartLocalTime();
        LocalTime bE = policy.getBreakEndLocalTime();

        long breakMinutes = overlapMinutes(start, overtime, bS, bE);
        return (int) Math.max(0, raw - breakMinutes);
    }


    /**
     * [from,to)에서 휴게시간을 제외한 분 계산
     */
    private static int minutesExcludingBreak(
            LocalDateTime from,
            LocalDateTime to,
            LocalDateTime breakStart,
            LocalDateTime breakEnd
    ) {
        long raw = Duration.between(from, to).toMinutes();
        if (raw <= 0) return 0;

        long breakOverlap = overlapMinutes(from, to, breakStart, breakEnd);
        return (int) Math.max(0, raw - breakOverlap);
    }

    private static long overlapMinutes(LocalDateTime aStart, LocalDateTime aEnd, LocalDateTime bStart, LocalDateTime bEnd) {
        LocalDateTime start = aStart.isAfter(bStart) ? aStart : bStart;
        LocalDateTime end = aEnd.isBefore(bEnd) ? aEnd : bEnd;
        if (!end.isAfter(start)) return 0;
        return Duration.between(start, end).toMinutes();
    }

    private static long overlapMinutes(LocalTime aStart, LocalTime aEnd, LocalTime bStart, LocalTime bEnd) {
        LocalTime start = aStart.isAfter(bStart) ? aStart : bStart;
        LocalTime end = aEnd.isBefore(bEnd) ? aEnd : bEnd;
        if (!end.isAfter(start)) return 0;
        return Duration.between(start, end).toMinutes();
    }

    private static boolean overlaps(LocalDateTime aStart, LocalDateTime aEnd, LocalDateTime bStart, LocalDateTime bEnd) {
        return aEnd.isAfter(bStart) && bEnd.isAfter(aStart);
    }

    /**
     * policy의 HHmm(Integer) 값을 workDate의 LocalDateTime으로 변환
     */
    public static LocalDateTime buildPolicyDateTime(LocalDate workDate, Integer hhmm) {
        if (hhmm == null) throw new IllegalArgumentException("시간(hhmm)이 null 입니다.");
        int h = hhmm / 100;
        int m = hhmm % 100;
        return LocalDateTime.of(workDate, LocalTime.of(h, m));
    }
}
