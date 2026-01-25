package boot.team.hr.eun.attendance.util;

import boot.team.hr.eun.attendance.entity.AttendancePolicy;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/*급여 정산을 위한 근무시간(분) 계산기.*/
public final class AttendanceTimeCalculator {

    private AttendanceTimeCalculator() {
    }

    public static WorkTimeResult calculateAtCheckOut(
            LocalDateTime checkIn,
            LocalDateTime checkOut,
            AttendancePolicy policy
    ) {
        if (checkIn == null) {
            throw new IllegalArgumentException("checkIn is null");
        }
        if (checkOut == null) {
            throw new IllegalArgumentException("checkOut is null");
        }

        LocalTime start = policy.getStartLocalTime();
        LocalTime overtimeStart = policy.getOvertimeStartLocalTime();

        int scheduledMinutes = minutesBetween(start, overtimeStart);

        // 지각 공제: START_TIME 이후에 출근한 만큼
        int lateMinutes = Math.max(0, minutesBetween(start, checkIn.toLocalTime()));
        lateMinutes = clamp(lateMinutes, 0, scheduledMinutes);

        // 조퇴 공제: OVERTIME_START 이전에 퇴근한 만큼
        int earlyLeaveMinutes = 0;
        if (checkOut.toLocalTime().isBefore(overtimeStart)) {
            earlyLeaveMinutes = Math.max(0, minutesBetween(checkOut.toLocalTime(), overtimeStart));
        }
        earlyLeaveMinutes = clamp(earlyLeaveMinutes, 0, scheduledMinutes);

        int unpaidMinutes = clamp(lateMinutes + earlyLeaveMinutes, 0, scheduledMinutes);

        // 정상 근무 인정 시간
        int normalMinutes = clamp(scheduledMinutes - unpaidMinutes, 0, scheduledMinutes);

        // 야근 시간: OVERTIME_START 이후 ~ 퇴근까지
        int overtimeMinutes = 0;
        if (!checkOut.toLocalTime().isBefore(overtimeStart)) {
            overtimeMinutes = Math.max(0, minutesBetween(overtimeStart, checkOut.toLocalTime()));
        }

        int totalMinutes = normalMinutes + overtimeMinutes;

        return new WorkTimeResult(
                totalMinutes,
                normalMinutes,
                overtimeMinutes,
                unpaidMinutes,
                scheduledMinutes,
                lateMinutes,
                earlyLeaveMinutes
        );
    }

    /**
     * 결근 확정 시 사용할 정산 분 계산.
     */
    public static WorkTimeResult calculateAbsent(AttendancePolicy policy) {
        int scheduledMinutes = minutesBetween(
                policy.getStartLocalTime(),
                policy.getOvertimeStartLocalTime()
        );
        return new WorkTimeResult(
                0,
                0,
                0,
                scheduledMinutes,
                scheduledMinutes,
                0,
                0
        );
    }

    /**
     * 휴가/외근(정상근무로 동일 기록)용.
     */
    public static WorkTimeResult calculateAsNormalFullDay(AttendancePolicy policy) {
        int scheduledMinutes = minutesBetween(
                policy.getStartLocalTime(),
                policy.getOvertimeStartLocalTime()
        );
        return new WorkTimeResult(
                scheduledMinutes,
                scheduledMinutes,
                0,
                0,
                scheduledMinutes,
                0,
                0
        );
    }

    public static LocalDateTime buildPolicyDateTime(LocalDate workDate, LocalTime time) {
        return LocalDateTime.of(workDate, time);
    }

    private static int minutesBetween(LocalTime from, LocalTime to) {
        return (int) Duration.between(from, to).toMinutes();
    }

    private static int clamp(int value, int min, int max) {
        return Math.min(max, Math.max(min, value));
    }

    public record WorkTimeResult(
            int totalMinutes,
            int normalMinutes,
            int overtimeMinutes,
            int unpaidMinutes,
            int scheduledMinutes,
            int lateMinutes,
            int earlyLeaveMinutes
    ) {
    }
}
