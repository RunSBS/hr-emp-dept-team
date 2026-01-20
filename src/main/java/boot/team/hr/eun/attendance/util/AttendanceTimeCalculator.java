package boot.team.hr.eun.attendance.util;

import boot.team.hr.eun.attendance.entity.AttendancePolicy;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * 근태 정책 기반 시간 계산 유틸
 * - 출근 시 지각 판단
 * - 퇴근 시 근무 시간 계산
 */
public class AttendanceTimeCalculator {

    /**
     * 지각 여부 판단
     */
    public static boolean isLate(
            AttendancePolicy policy,
            LocalDateTime checkInTime
    ) {
        LocalTime lateTime = toLocalTime(policy.getLateTime());
        return checkInTime.toLocalTime().isAfter(lateTime);
    }

    /**
     * 근무 시간 계산 결과 DTO (내부 사용용)
     */
    public static WorkTimeResult calculateWorkTime(
            AttendancePolicy policy,
            LocalDateTime checkIn,
            LocalDateTime checkOut
    ) {
        LocalDate date = checkIn.toLocalDate();

        LocalDateTime overtimeStart = LocalDateTime.of(
                date,
                toLocalTime(policy.getOvertimeStart())
        );

        long totalMinutes = Duration.between(checkIn, checkOut).toMinutes();

        long normalMinutes;
        long overtimeMinutes;

        if (checkOut.isAfter(overtimeStart)) {
            normalMinutes = Duration.between(checkIn, overtimeStart).toMinutes();
            overtimeMinutes = Duration.between(overtimeStart, checkOut).toMinutes();
        } else {
            normalMinutes = totalMinutes;
            overtimeMinutes = 0;
        }

        return new WorkTimeResult(
                (int) totalMinutes,
                (int) Math.max(normalMinutes, 0),
                (int) Math.max(overtimeMinutes, 0)
        );
    }

    /**
     * 900 → 09:00 변환
     */
    private static LocalTime toLocalTime(int hhmm) {
        int hour = hhmm / 100;
        int minute = hhmm % 100;
        return LocalTime.of(hour, minute);
    }

    /**
     * 근무 시간 계산 결과용 내부 클래스
     */
    public record WorkTimeResult(
            int totalMinutes,
            int normalMinutes,
            int overtimeMinutes
    ) {
    }
}
