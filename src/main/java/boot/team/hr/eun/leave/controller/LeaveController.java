package boot.team.hr.eun.leave.controller;

import boot.team.hr.eun.leave.dto.LeaveRequestCreateDto;
import boot.team.hr.eun.leave.dto.LeaveRequestResponseDto;
import boot.team.hr.eun.leave.dto.LeaveTypeResponseDto;
import boot.team.hr.eun.leave.service.LeaveService;

import boot.team.hr.min.account.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/leave")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    // 휴가 유형 조회
    @GetMapping("/types")
    public List<LeaveTypeResponseDto> getLeaveTypes() {
        return leaveService.getLeaveTypes();
    }

    // 휴가 신청
    @PostMapping("/request")
    public ResponseEntity<Void> requestLeave(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody LeaveRequestCreateDto dto
    ) {
        leaveService.requestLeave(user.getUsername(), dto); // email
        return ResponseEntity.ok().build();
    }

    // 휴가 신청 내역 조회
    @GetMapping("/my")
    public List<LeaveRequestResponseDto> getMyLeaves(
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return leaveService.getMyLeaveRequests(user.getUsername()); // email
    }
}



