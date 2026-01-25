package boot.team.hr.eun.attendance.service;

import boot.team.hr.eun.attendance.dto.AttendancePolicyRequestDto;
import boot.team.hr.eun.attendance.dto.AttendancePolicyResponseDto;
import boot.team.hr.eun.attendance.entity.AttendancePolicy;
import boot.team.hr.eun.attendance.repo.AttendancePolicyRepository;
import boot.team.hr.eun.attendance.vaildator.AttendancePolicyValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AttendancePolicyServiceImpl implements AttendancePolicyService {

    private final AttendancePolicyRepository policyRepository;
    private final AttendancePolicyValidator policyValidator;

    /* ===================== 현재 적용 정책 조회 ===================== */
    @Override
    @Transactional(readOnly = true)
    public AttendancePolicyResponseDto getCurrentPolicy() {
        AttendancePolicy policy = policyRepository.findCurrentPolicy()
                .orElseThrow(() -> new IllegalStateException("현재 적용 중인 근태 정책이 없습니다."));
        return toResponse(policy);
    }

    /* ===================== 전체 정책 조회 ===================== */
    @Override
    @Transactional(readOnly = true)
    public List<AttendancePolicyResponseDto> getAllPolicies() {
        return policyRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    /* ===================== 정책 생성 ===================== */
    @Override
    public AttendancePolicyResponseDto createPolicy(
            AttendancePolicyRequestDto request,
            Long adminId
    ) {
        // 기간 겹침 검사
        if (policyRepository.existsOverlappingPolicy(
                null,
                request.getEffectiveFrom(),
                request.getEffectiveTo()
        )) {
            throw new IllegalStateException("이미 적용 중인 근태 정책과 기간이 겹칩니다.");
        }

        // 엔티티 생성
        AttendancePolicy policy = AttendancePolicy.create(
                request.getStartTime(),
                request.getLateTime(),
                request.getOvertimeStart(),
                request.getBreakStart(),
                request.getBreakEnd(),
                request.getDescription(),
                request.getEffectiveFrom(),
                request.getEffectiveTo(),
                adminId.toString()
        );

        // 유효성 검사
        policyValidator.validateTime(policy);
        policyValidator.validatePeriod(
                request.getEffectiveFrom(),
                request.getEffectiveTo()
        );

        policyRepository.save(policy);
        return toResponse(policy);
    }

    /* ===================== 정책 수정 ===================== */
    @Override
    public AttendancePolicyResponseDto updatePolicy(
            Long policyId,
            AttendancePolicyRequestDto request,
            Long adminId
    ) {
        AttendancePolicy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new IllegalStateException("근태 정책이 존재하지 않습니다."));

        // 본인 제외 기간 겹침 검사
        if (policyRepository.existsOverlappingPolicy(
                policyId,
                request.getEffectiveFrom(),
                request.getEffectiveTo()
        )) {
            throw new IllegalStateException("이미 적용 중인 근태 정책과 기간이 겹칩니다.");
        }

        // 상태 변경
        policy.change(
                request.getStartTime(),
                request.getLateTime(),
                request.getOvertimeStart(),
                request.getBreakStart(),
                request.getBreakEnd(),
                request.getDescription(),
                request.getEffectiveFrom(),
                request.getEffectiveTo(),
                adminId.toString()
        );

        // 유효성 검사
        policyValidator.validateTime(policy);
        policyValidator.validatePeriod(
                request.getEffectiveFrom(),
                request.getEffectiveTo()
        );

        return toResponse(policy);
    }

    /* ===================== Entity → DTO ===================== */
    private AttendancePolicyResponseDto toResponse(AttendancePolicy policy) {
        return AttendancePolicyResponseDto.builder()
                .policyId(policy.getPolicyId())
                .startTime(policy.getStartTime())
                .lateTime(policy.getLateTime())
                .overtimeStart(policy.getOvertimeStart())
                .breakStart(policy.getBreakStart())
                .breakEnd(policy.getBreakEnd())
                .description(policy.getDescription())
                .effectiveFrom(policy.getEffectiveFrom())
                .effectiveTo(policy.getEffectiveTo())
                .build();
    }
}
