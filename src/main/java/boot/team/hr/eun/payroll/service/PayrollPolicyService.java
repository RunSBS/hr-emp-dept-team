package boot.team.hr.eun.payroll.service;

import boot.team.hr.eun.payroll.dto.PayrollPolicyResponseDto;
import boot.team.hr.eun.payroll.dto.PayrollPolicyUpdateRequestDto;

public interface PayrollPolicyService {

    PayrollPolicyResponseDto getCurrentPolicy();

    PayrollPolicyResponseDto updatePolicy(PayrollPolicyUpdateRequestDto req, String updatedBy);
}
