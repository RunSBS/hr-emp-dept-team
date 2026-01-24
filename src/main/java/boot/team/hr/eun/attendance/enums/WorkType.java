package boot.team.hr.eun.attendance.enums;

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
    public static WorkType decideAtCheckOut(WorkType currentType) {

        // 휴가는 퇴근 개념 없음
        if (currentType == LEAVE) {
            throw new IllegalStateException("휴가 상태에서는 퇴근할 수 없습니다.");
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
