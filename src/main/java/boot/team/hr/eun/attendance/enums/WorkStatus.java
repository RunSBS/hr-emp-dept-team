package boot.team.hr.eun.attendance.enums;

import java.time.LocalDateTime;
import java.time.LocalTime;

public enum WorkStatus {

    PENDING,       // 근무 전 (출근 전 상태)
    NORMAL,        // 정상
    LATE,          // 지각
    EARLY_LEAVE,   // 조퇴
    ABSENT;        // 결근

    /* ===============================
       출근 시 상태 판단
    =============================== */
    public static WorkStatus decideAtCheckIn(
            LocalDateTime checkInTime,
            LocalTime lateTime
    ) {
        if (checkInTime.toLocalTime().isAfter(lateTime)) {
            return LATE;
        }
        return NORMAL;
    }

    /* ===============================
       퇴근 시 상태 판단
    =============================== */
    public static WorkStatus decideAtCheckOut(
            WorkStatus currentStatus,
            LocalDateTime checkOutTime,
            LocalTime startTime
    ) {
        // 정상 출근이면 유지
        if (currentStatus == NORMAL) {
            return NORMAL;
        }

        // 이미 지각이면 유지
        if (currentStatus == LATE) {
            return LATE;
        }

        // 조퇴 판단
        if (checkOutTime.toLocalTime().isBefore(startTime)) {
            return EARLY_LEAVE;
        }

        return currentStatus;
    }
}
