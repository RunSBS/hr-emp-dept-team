package boot.team.hr.gyu.service;

import boot.team.hr.gyu.dto.RewardPolicyDTO;
import boot.team.hr.gyu.entity.RewardPolicy;
import boot.team.hr.gyu.repository.RewardPolicyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class RewardPolicyService {

    private final RewardPolicyRepository repository;

    @Autowired
    public RewardPolicyService(RewardPolicyRepository repository) {
        this.repository = repository;
    }

    // 전체 조회
    @Transactional(readOnly = true)
    public List<RewardPolicyDTO> getAllPolicies() {
        return repository.findAllByOrderByCreatedAtDesc().stream()
                .map(RewardPolicyDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // ID로 조회
    @Transactional(readOnly = true)
    public RewardPolicyDTO getPolicyById(Long id) {
        RewardPolicy entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("포상 정책을 찾을 수 없습니다. ID: " + id));
        return RewardPolicyDTO.fromEntity(entity);
    }

    // 활성화 상태로 조회
    @Transactional(readOnly = true)
    public List<RewardPolicyDTO> getActivePolicies() {
        return repository.findByIsActive(true).stream()
                .map(RewardPolicyDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // 생성
    public RewardPolicyDTO createPolicy(RewardPolicyDTO dto) {
        // 중복 체크
        if (repository.existsByPolicyName(dto.getPolicyName())) {
            throw new RuntimeException("이미 존재하는 포상 정책명입니다: " + dto.getPolicyName());
        }

        RewardPolicy entity = new RewardPolicy(
                dto.getPolicyName(),
                dto.getRewardType(),
                dto.getRewardAmount(),
                dto.getDescription(),
                dto.getIsActive() != null ? dto.getIsActive() : true
        );

        RewardPolicy savedEntity = repository.save(entity);
        return RewardPolicyDTO.fromEntity(savedEntity);
    }

    // 수정
    public RewardPolicyDTO updatePolicy(Long id, RewardPolicyDTO dto) {
        RewardPolicy entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("포상 정책을 찾을 수 없습니다. ID: " + id));

        // 정책명 중복 체크 (자기 자신 제외)
        if (!entity.getPolicyName().equals(dto.getPolicyName()) &&
            repository.existsByPolicyName(dto.getPolicyName())) {
            throw new RuntimeException("이미 존재하는 포상 정책명입니다: " + dto.getPolicyName());
        }

        entity.setPolicyName(dto.getPolicyName());
        entity.setRewardType(dto.getRewardType());
        entity.setRewardAmount(dto.getRewardAmount());
        entity.setDescription(dto.getDescription());
        entity.setIsActive(dto.getIsActive());

        RewardPolicy updatedEntity = repository.save(entity);
        return RewardPolicyDTO.fromEntity(updatedEntity);
    }

    // 삭제
    public void deletePolicy(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("포상 정책을 찾을 수 없습니다. ID: " + id);
        }
        repository.deleteById(id);
    }

    // 활성화 상태 변경
    public RewardPolicyDTO toggleActiveStatus(Long id) {
        RewardPolicy entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("포상 정책을 찾을 수 없습니다. ID: " + id));

        entity.setIsActive(!entity.getIsActive());
        RewardPolicy updatedEntity = repository.save(entity);
        return RewardPolicyDTO.fromEntity(updatedEntity);
    }
}