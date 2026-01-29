package boot.team.hr.eun.payroll.controller;

import boot.team.hr.eun.payroll.dto.PayrollPolicyResponseDto;
import boot.team.hr.eun.payroll.service.PayrollPolicyService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/payroll")
public class PayrollPolicyController {

    private final PayrollPolicyService payrollPolicyService;

    // ✅ 사원(및 로그인 사용자)용: 급여 정책 조회(최신 1건)
    @GetMapping("/policy")
    public PayrollPolicyResponseDto getPolicy() {
        return payrollPolicyService.getCurrentPolicy();
    }
}
