package boot.team.hr.eun.payroll.service;

import boot.team.hr.eun.payroll.dto.PayrollPolicyResponseDto;
import boot.team.hr.eun.payroll.dto.PayrollPolicyUpdateRequestDto;
import boot.team.hr.eun.payroll.entity.PayrollPolicy;
import boot.team.hr.eun.payroll.repo.PayrollPolicyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional
public class PayrollPolicyServiceImpl implements PayrollPolicyService {

    private final PayrollPolicyRepository payrollPolicyRepository;

    @Override
    @Transactional(readOnly = true)
    public PayrollPolicyResponseDto getCurrentPolicy() {
        PayrollPolicy latest = payrollPolicyRepository.findLatestFirst().stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("급여 정책이 없습니다. 정책을 먼저 생성/수정하세요."));

        return toResponse(latest);
    }

    @Override
    public PayrollPolicyResponseDto updatePolicy(PayrollPolicyUpdateRequestDto req, String updatedBy) {

        PayrollPolicy policy = payrollPolicyRepository.findLatestFirst().stream()
                .findFirst()
                .orElseGet(PayrollPolicy::new);

        if (req.getRateMultiplier() == null) {
            throw new IllegalArgumentException("rateMultiplier는 필수입니다.");
        }

        // Double -> BigDecimal
        policy.setRateMultiplier(BigDecimal.valueOf(req.getRateMultiplier()));

        if (req.getWorkMinutesPerMonth() != null) {
            policy.setWorkMinutesPerMonth(req.getWorkMinutesPerMonth());
        }

        policy.setDescription(req.getDescription());
        policy.setUpdatedBy(updatedBy);

        // 엔티티 updatedAt이 LocalDate인 전제
        policy.setUpdatedAt(LocalDate.now());

        PayrollPolicy saved = payrollPolicyRepository.save(policy);
        return toResponse(saved);
    }

    private PayrollPolicyResponseDto toResponse(PayrollPolicy p) {
        Double multiplier = (p.getRateMultiplier() == null) ? null : p.getRateMultiplier().doubleValue();

        return PayrollPolicyResponseDto.builder()
                .payrollPolicyId(p.getPayrollPolicyId())
                .rateMultiplier(multiplier)
                .workMinutesPerMonth(p.getWorkMinutesPerMonth())
                .description(p.getDescription())
                .updatedBy(p.getUpdatedBy())
                .updatedAt(p.getUpdatedAt() == null ? null : p.getUpdatedAt().atStartOfDay())
                .build();
    }
}
