package boot.team.hr.eun.leave.controller;

import boot.team.hr.eun.leave.dto.LeaveBalanceResponseDto;
import boot.team.hr.eun.leave.service.EmployeeLeaveBalanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/employee/leave-balance")
@RequiredArgsConstructor
public class EmployeeLeaveBalanceController {

    private final EmployeeLeaveBalanceService employeeLeaveBalanceService;

    @GetMapping
    public List<LeaveBalanceResponseDto> getMyLeaveBalances(
            Authentication authentication
    ) {
        // ⭐ 로그인한 사용자 email
        String employeeId = authentication.getName();

        return employeeLeaveBalanceService.getMyLeaveBalances(employeeId);
    }
}
