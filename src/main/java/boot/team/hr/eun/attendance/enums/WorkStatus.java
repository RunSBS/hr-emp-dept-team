package boot.team.hr.eun.attendance.enums;

import java.time.LocalDateTime;
import java.time.LocalTime;

public enum WorkStatus {
    PENDING,
    NORMAL,
    LATE,
    EARLY_LEAVE,
    ABSENT;

    public static WorkStatus decideAtCheckIn(LocalDateTime checkInTime, LocalTime lateTime) {
        return checkInTime.toLocalTime().isAfter(lateTime) ? LATE : NORMAL;
    }

    // ✅ 조퇴: OVERTIME_START 이전 퇴근
    public static WorkStatus decideAtCheckOut(
            WorkStatus currentStatus,
            LocalDateTime checkOutTime,
            LocalTime overtimeStartTime
    ) {
        if (currentStatus == LATE) return LATE;
        if (currentStatus == NORMAL) {
            if (checkOutTime.toLocalTime().isBefore(overtimeStartTime)) {
                return EARLY_LEAVE;
            }
            return NORMAL;
        }
        return currentStatus;
    }
}
