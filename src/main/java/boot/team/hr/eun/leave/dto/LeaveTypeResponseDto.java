package boot.team.hr.eun.leave.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LeaveTypeResponseDto {

    private Long leaveTypeId;
    private String leaveName;
    private Boolean isPaid;
}
