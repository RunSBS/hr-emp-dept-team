package boot.team.hr.eun.leave.service;

import boot.team.hr.eun.leave.dto.LeaveApprovalDto;
import boot.team.hr.eun.leave.dto.LeaveRequestResponseDto;

import java.util.List;

public interface AdminLeaveRequestService {
    List<LeaveRequestResponseDto> getPendingLeaves();
    void approveLeave(Long leaveId, String managerId);
    void rejectLeave(Long leaveId, String managerId);
}
