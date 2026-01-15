package boot.team.hr.gyu.service;

import boot.team.hr.gyu.dto.CurrentUserDTO;
import boot.team.hr.gyu.dto.RewardPolicyDTO;
import boot.team.hr.gyu.entity.RewardPolicy;
import boot.team.hr.gyu.repository.RewardPolicyRepository;
import boot.team.hr.hyun.emp.entity.Emp;
import boot.team.hr.hyun.emp.repo.EmpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RewardPolicyService {

    private final RewardPolicyRepository policyRepository;
    private final EmpRepository empRepository;

    /**
     * 현재 로그인 사용자 정보 조회
     */
    public CurrentUserDTO getCurrentUser(String email) {
        Emp emp = empRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        Integer deptId = null;
        if (emp.getDept() != null) {
            deptId = emp.getDept().getDeptNo();
        }

        System.out.println("[포상정책관리] 사용자 조회 - 이메일: " + email + ", 이름: " + emp.getEmpName() + ", 직급: " + emp.getEmpRole());

        return CurrentUserDTO.builder()
                .empId(emp.getEmpId())
                .empName(emp.getEmpName())
                .deptId(deptId)
                .email(emp.getEmail())
                .empRole(emp.getEmpRole())
                .build();
    }

    /**
     * 포상 정책 관리 권한 체크 (empRole == "REWARD" 또는 "CEO"만 가능)
     */
    public boolean hasManagementPermission(String email) {
        Emp emp = empRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        boolean hasPermission = "REWARD".equals(emp.getEmpRole()) || "CEO".equals(emp.getEmpRole());
        System.out.println("[포상정책관리] 권한 체크 - 사용자: " + emp.getEmpName() + ", 직급: " + emp.getEmpRole() + ", 권한 여부: " + hasPermission);

        return hasPermission;
    }

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
                .description(policy.getDescription())
                .isActive(policy.getIsActive())
                .createdAt(policy.getCreatedAt())
                .build();
    }
}