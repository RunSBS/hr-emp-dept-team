package boot.team.hr.eun.attendance.service;

import boot.team.hr.eun.attendance.dto.AttendancePolicyRequestDto;
import boot.team.hr.eun.attendance.dto.AttendancePolicyResponseDto;
import boot.team.hr.eun.attendance.entity.AttendancePolicy;
import boot.team.hr.eun.attendance.repo.AttendancePolicyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AttendancePolicyServiceImpl implements AttendancePolicyService {

    private final AttendancePolicyRepository policyRepository;

    @Override
    @Transactional(readOnly = true)
    public AttendancePolicyResponseDto getCurrentPolicy() {
        AttendancePolicy policy = policyRepository.findCurrentPolicy()
                .orElseThrow(() -> new IllegalStateException("현재 적용 중인 근태 정책이 없습니다."));

        return toResponse(policy);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendancePolicyResponseDto> getAllPolicies() {
        return policyRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public AttendancePolicyResponseDto createPolicy(
            AttendancePolicyRequestDto request,
            Long adminId
    ) {
        if (policyRepository.existsOverlappingPolicy(
                null,
                request.getEffectiveFrom(),
                request.getEffectiveTo()
        )) {
            throw new IllegalStateException("이미 적용 중인 근태 정책과 기간이 겹칩니다.");
        }

        AttendancePolicy policy = AttendancePolicy.create(
                request.getStartTime(),
                request.getLateTime(),
                request.getOvertimeStart(),
                request.getDescription(),
                request.getEffectiveFrom(),
                request.getEffectiveTo(),
                adminId
        );

        policyRepository.save(policy);
        return toResponse(policy);
    }



    @Override
    public AttendancePolicyResponseDto updatePolicy(
            Long policyId,
            AttendancePolicyRequestDto request,
            Long adminId
    ) {
        AttendancePolicy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new IllegalStateException("근태 정책이 존재하지 않습니다."));

        if (policyRepository.existsOverlappingPolicy(
                policy.getPolicyId(),
                request.getEffectiveFrom(),
                request.getEffectiveTo()
        )) {
            throw new IllegalStateException("이미 적용 중인 근태 정책과 기간이 겹칩니다.");
        }

        policy.updatePolicy(
                request.getStartTime(),
                request.getLateTime(),
                request.getOvertimeStart(),
                request.getDescription(),
                request.getEffectiveFrom(),
                request.getEffectiveTo(),
                adminId
        );

        return toResponse(policy);
    }

    private AttendancePolicyResponseDto toResponse(AttendancePolicy policy) {
        return AttendancePolicyResponseDto.builder()
                .policyId(policy.getPolicyId())
                .startTime(policy.getStartTime())
                .lateTime(policy.getLateTime())
                .overtimeStart(policy.getOvertimeStart())
                .description(policy.getDescription())
                .effectiveFrom(policy.getEffectiveFrom())
                .effectiveTo(policy.getEffectiveTo())
                .build();
    }
}
