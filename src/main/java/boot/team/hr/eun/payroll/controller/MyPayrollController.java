package boot.team.hr.eun.payroll.controller;

import boot.team.hr.eun.payroll.dto.PayrollSummaryResponseDto;
import boot.team.hr.eun.payroll.service.PayrollService;
import boot.team.hr.min.account.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping("/payroll")
public class MyPayrollController {

    private final PayrollService payrollService;

    @GetMapping("/my/summary")
    public PayrollSummaryResponseDto mySummary(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam String payMonth
    ) {
        if (user == null || user.getEmpId() == null) {
            throw new IllegalStateException("로그인 정보(empId)가 없습니다.");
        }
        return payrollService.getPayrollSummary(user.getEmpId(), LocalDate.parse(payMonth));
    }
}
