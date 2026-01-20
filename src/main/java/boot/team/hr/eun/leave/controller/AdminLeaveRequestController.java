package boot.team.hr.eun.leave.controller;

import boot.team.hr.eun.leave.dto.LeaveRequestResponseDto;
import boot.team.hr.eun.leave.service.AdminLeaveRequestService;
import boot.team.hr.hyun.emp.entity.Emp;
import boot.team.hr.hyun.emp.repo.EmpRepository;
import boot.team.hr.min.account.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/leave-request")
@RequiredArgsConstructor
public class AdminLeaveRequestController {

    private final AdminLeaveRequestService adminLeaveRequestService;
    private final EmpRepository empRepository;

    // 로그인 관리자 정보 조회
    @GetMapping("/emp/current")
    public Emp getCurrentAdmin(@AuthenticationPrincipal CustomUserDetails user) {
        String email = user.getUsername();
        return empRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("로그인 관리자 정보를 찾을 수 없습니다."));
    }

    // 승인 대기 휴가 조회
    @GetMapping("/pending")
    public List<LeaveRequestResponseDto> getPendingLeaves() {
        return adminLeaveRequestService.getPendingLeaves();
    }

    // 휴가 승인
    @PutMapping("/{leaveId}/approve")
    public void approveLeave(
            @PathVariable Long leaveId,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        String email = user.getUsername();
        Emp emp = empRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("로그인 관리자 정보를 찾을 수 없습니다."));
        String managerId = emp.getEmpId();

        adminLeaveRequestService.approveLeave(leaveId, managerId);
    }

    // 휴가 반려
    @PutMapping("/{leaveId}/reject")
    public void rejectLeave(
            @PathVariable Long leaveId,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        String email = user.getUsername();
        Emp emp = empRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("로그인 관리자 정보를 찾을 수 없습니다."));
        String managerId = emp.getEmpId();

        adminLeaveRequestService.rejectLeave(leaveId, managerId);
    }
}
