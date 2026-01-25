package boot.team.hr.eun.attendance.enums;

import boot.team.hr.eun.attendance.entity.AttendancePolicy;

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
            AttendancePolicy policy
    ) {
        if (currentStatus == ABSENT) return ABSENT;
        if (currentStatus == PENDING) return PENDING;

        // 조퇴 판단 기준: OVERTIME_START 이전 퇴근
        LocalTime overtimeStart = policy.getOvertimeStartLocalTime();
        if (checkOutTime.toLocalTime().isBefore(overtimeStart)) {
            return EARLY_LEAVE;
        }

        // 지각이면 지각 유지
        if (currentStatus == LATE) {
            return LATE;
        }

        // 그 외는 정상
        return NORMAL;
    }
}
