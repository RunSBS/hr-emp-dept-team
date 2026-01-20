package boot.team.hr.eun.leave.dto;

import boot.team.hr.eun.leave.enums.ApprovalStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class LeaveRequestResponseDto {

    private Long leaveId;
    private String employeeId;
    private String leaveTypeName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer leaveMinutes;
    private ApprovalStatus approvalStatus;
    private String leaveReason;
    private LocalDateTime createdAt;
}
