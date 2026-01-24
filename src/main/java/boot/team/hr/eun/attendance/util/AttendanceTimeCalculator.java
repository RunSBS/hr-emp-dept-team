package boot.team.hr.eun.attendance.util;

import java.time.Duration;
import java.time.LocalDateTime;

public class AttendanceTimeCalculator {

    private AttendanceTimeCalculator() {}
    
    // 근무 계산만 담당
    public static WorkTimeResult calculate(
            LocalDateTime checkIn,
            LocalDateTime checkOut,
            LocalDateTime overtimeStart
    ) {
        long totalMinutes =
                Duration.between(checkIn, checkOut).toMinutes();

        long normalMinutes;
        long overtimeMinutes;

        if (checkOut.isAfter(overtimeStart)) {
            normalMinutes =
                    Duration.between(checkIn, overtimeStart).toMinutes();
            overtimeMinutes =
                    Duration.between(overtimeStart, checkOut).toMinutes();
        } else {
            normalMinutes = totalMinutes;
            overtimeMinutes = 0;
        }

        return new WorkTimeResult(
                (int) totalMinutes,
                (int) normalMinutes,
                (int) overtimeMinutes
        );
    }

    public record WorkTimeResult(
            int totalMinutes,
            int normalMinutes,
            int overtimeMinutes
    ) {}
}
