package boot.team.hr.eun.attendance.enums;

import java.time.LocalTime;

public enum WorkType {


    OFFICE,     // 출근
    OFF,        // 퇴근
    LEAVE,      // 휴가
    NIGHT,      // 야간
    OUTSIDE;    // 외근

    /* ===============================
       출근 시 근무 타입 결정
    =============================== */
    public static WorkType decideAtCheckIn() {
        return OFFICE;
    }

    /* ===============================
       퇴근 시 근무 타입 결정
    =============================== */
    public static WorkType decideAtCheckOut(
            WorkType currentType,
            LocalTime checkOutTime,
            LocalTime overtimeStart
    ) {
        // 휴가(연차, 병가, 무급휴가)와 외근은 퇴근 개념 없음
        if (currentType == LEAVE || currentType == OUTSIDE) {
            throw new IllegalStateException("휴가 또는 외근 상태에서는 퇴근할 수 없습니다.");
        }

        // 야근(NIGHT) 기록: OVERTIME_START + 1시간 이후 퇴근
        if (!checkOutTime.isBefore(overtimeStart.plusHours(1))) {
            return NIGHT;
        }

        return OFF;
    }

    /* ===============================
       퇴근 가능 여부
    =============================== */
    public boolean canCheckOut() {
        return this == OFFICE || this == NIGHT;
    }
}
