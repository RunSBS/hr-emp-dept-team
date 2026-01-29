package boot.team.hr.eun.payroll.controller;

import boot.team.hr.eun.payroll.dto.*;
import boot.team.hr.eun.payroll.service.PayrollPolicyService;
import boot.team.hr.eun.payroll.service.PayrollService;
import boot.team.hr.min.account.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/payroll")
public class PayrollController {

    private final PayrollService payrollService;
    private final PayrollPolicyService payrollPolicyService;

    @PostMapping("/close")
    public void close(@RequestParam String payMonth) {
        payrollService.closeMonthlyPayroll(LocalDate.parse(payMonth));
    }

    @PostMapping("/salary")
    public void upsertSalary(@RequestBody PayrollUpsertSalaryRequestDto req) {
        payrollService.upsertMonthlySalaryInfo(req);
    }

    // ✅ 관리자: 사원 1명 월 급여 요약 조회
    @GetMapping("/summary")
    public PayrollSummaryResponseDto summary(@RequestParam String empId, @RequestParam String payMonth) {
        return payrollService.getPayrollSummary(empId, LocalDate.parse(payMonth));
    }

    @GetMapping("/monthly-list")
    public List<PayrollMonthlyListItemDto> monthlyList(@RequestParam String payMonth) {
        return payrollService.getMonthlyPayrollList(LocalDate.parse(payMonth));
    }

    @GetMapping("/policy")
    public PayrollPolicyResponseDto getPolicy() {
        return payrollPolicyService.getCurrentPolicy();
    }

    @PatchMapping("/policy")
    public PayrollPolicyResponseDto updatePolicy(
            @RequestBody PayrollPolicyUpdateRequestDto req,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        String updatedBy = (user != null && user.getEmpId() != null) ? user.getEmpId() : "ADMIN_SYSTEM";
        return payrollPolicyService.updatePolicy(req, updatedBy);
    }
}
