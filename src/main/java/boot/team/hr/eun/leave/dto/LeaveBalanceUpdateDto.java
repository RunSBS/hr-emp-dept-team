package boot.team.hr.eun.leave.dto;

import lombok.Getter;

@Getter
public class LeaveBalanceUpdateDto {

    // 분 단위 (예: 1일 = 480)
    private Integer totalLeaveMinutes;
}
