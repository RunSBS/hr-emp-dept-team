package boot.team.hr.gyu.service;

import boot.team.hr.gyu.dto.RewardPolicyDTO;
import boot.team.hr.gyu.entity.RewardPolicy;
import boot.team.hr.gyu.repository.RewardPolicyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RewardPolicyService {

    private final RewardPolicyRepository policyRepository;

    @Transactional(readOnly = true)
    public List<RewardPolicyDTO> getAllPolicies() {
        return policyRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RewardPolicyDTO getPolicyById(Long id) {
        RewardPolicy policy = policyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("포상 정책을 찾을 수 없습니다."));
        return convertToDTO(policy);
    }

    @Transactional
    public Long createPolicy(RewardPolicyDTO dto) {
        RewardPolicy policy = RewardPolicy.builder()
                .policyName(dto.getPolicyName())
                .rewardType(dto.getRewardType())
                .rewardAmount(dto.getRewardAmount())
                .description(dto.getDescription())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : "Y")
                .build();

        return policyRepository.save(policy).getPolicyId();
    }

    @Transactional
    public void updatePolicy(Long id, RewardPolicyDTO dto) {
        RewardPolicy policy = policyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("포상 정책을 찾을 수 없습니다."));

        policy.setPolicyName(dto.getPolicyName());
        policy.setRewardType(dto.getRewardType());
        policy.setRewardAmount(dto.getRewardAmount());
        policy.setDescription(dto.getDescription());
        policy.setIsActive(dto.getIsActive());

        policyRepository.save(policy);
    }

    @Transactional
    public void deletePolicy(Long id) {
        if (!policyRepository.existsById(id)) {
            throw new IllegalArgumentException("포상 정책을 찾을 수 없습니다.");
        }
        policyRepository.deleteById(id);
    }

    private RewardPolicyDTO convertToDTO(RewardPolicy policy) {
        return RewardPolicyDTO.builder()
                .policyId(policy.getPolicyId())
                .policyName(policy.getPolicyName())
                .rewardType(policy.getRewardType())
                .rewardAmount(policy.getRewardAmount())
                .description(policy.getDescription())
                .isActive(policy.getIsActive())
                .createdAt(policy.getCreatedAt())
                .build();
    }
}