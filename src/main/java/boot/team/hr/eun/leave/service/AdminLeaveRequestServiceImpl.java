package boot.team.hr.eun.leave.service;

import boot.team.hr.eun.leave.dto.LeaveApprovalDto;
import boot.team.hr.eun.leave.dto.LeaveRequestResponseDto;
import boot.team.hr.eun.leave.entity.LeaveBalance;
import boot.team.hr.eun.leave.entity.LeaveRequest;
import boot.team.hr.eun.leave.enums.ApprovalStatus;
import boot.team.hr.eun.leave.repo.LeaveBalanceRepository;
import boot.team.hr.eun.leave.repo.LeaveRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminLeaveRequestServiceImpl implements AdminLeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;

    @Override
    @Transactional(readOnly = true)
    public List<LeaveRequestResponseDto> getPendingLeaves() {
        return leaveRequestRepository.findByApprovalStatusOrderByCreatedAtDesc(ApprovalStatus.PENDING)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public void approveLeave(Long leaveId, String managerId) {
        LeaveRequest request = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new IllegalArgumentException("휴가 요청이 존재하지 않습니다."));

        request.approve(managerId);

        // LeaveBalance 업데이트
        LeaveBalance balance = leaveBalanceRepository
                .findByEmployeeIdAndLeaveYear(request.getEmployeeId(), request.getStartDate().getYear())
                .orElseThrow(() -> new IllegalArgumentException("해당 연도의 연차 정보가 없습니다."));
        balance.useLeave(request.getLeaveMinutes());

        leaveRequestRepository.save(request);
        leaveBalanceRepository.save(balance);
    }

    @Override
    public void rejectLeave(Long leaveId, String managerId) {
        LeaveRequest request = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new IllegalArgumentException("휴가 요청이 존재하지 않습니다."));

        request.reject(managerId);

        leaveRequestRepository.save(request);
    }

    private LeaveRequestResponseDto toResponse(LeaveRequest r) {
        return LeaveRequestResponseDto.builder()
                .leaveId(r.getLeaveId())
                .employeeId(r.getEmployeeId())
                .leaveTypeName(r.getLeaveType().getLeaveName())
                .startDate(r.getStartDate())
                .endDate(r.getEndDate())
                .leaveMinutes(r.getLeaveMinutes())
                .approvalStatus(r.getApprovalStatus())
                .leaveReason(r.getLeaveReason())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
