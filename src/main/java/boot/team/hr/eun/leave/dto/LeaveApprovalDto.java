package boot.team.hr.eun.leave.dto;

import lombok.Data;

@Data
public class LeaveApprovalDto {
    private String approvalStatus; // "APPROVED" 또는 "REJECTED"
}
