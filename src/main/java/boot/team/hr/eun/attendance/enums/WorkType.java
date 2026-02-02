package boot.team.hr.eun.attendance.enums;

import java.time.LocalTime;

public enum WorkType {

    OFFICE,     // 출근
    OFF,        // 퇴근
    LEAVE,      // 휴가
    NIGHT,      // 야간
    OUTSIDE;    // 외근

    public static WorkType decideAtCheckIn() {
        return OFFICE;
    }

    public static WorkType decideAtCheckOut(
            WorkType currentType,
            LocalTime checkOutTime,
            LocalTime overtimeStart
    ) {
        if (currentType == LEAVE || currentType == OUTSIDE) {
            throw new IllegalStateException("휴가 또는 외근 상태에서는 퇴근할 수 없습니다.");
        }

        // NIGHT는 '야근중' 의미. NIGHT 전환은 스케줄러에서 처리하고,
        // 퇴근 버튼을 누르면 최종적으로 OFF로 변경한다.
        return OFF;
    }

    public boolean canCheckOut() {
        return this == OFFICE || this == NIGHT;
    }
}
