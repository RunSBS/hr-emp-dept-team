package boot.team.hr.gyu.service;

import boot.team.hr.gyu.dto.CurrentUserDTO;
import boot.team.hr.gyu.dto.NomineeDTO;
import boot.team.hr.gyu.dto.RewardCandidateDTO;
import boot.team.hr.gyu.entity.RewardCandidate;
import boot.team.hr.gyu.entity.RewardPolicy;
import boot.team.hr.gyu.repository.RewardCandidateRepository;
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
public class RewardCandidateService {

    private final RewardCandidateRepository candidateRepository;
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

        return CurrentUserDTO.builder()
                .empId(emp.getEmpId())
                .empName(emp.getEmpName())
                .deptId(deptId)
                .email(emp.getEmail())
                .empRole(emp.getEmpRole())
                .build();
    }

    /**
     * 추천 권한 체크 (CEO 또는 LEADER만 가능)
     */
    public boolean hasNominationPermission(String email) {
        Emp emp = empRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        boolean hasPermission = "CEO".equals(emp.getEmpRole()) || "LEADER".equals(emp.getEmpRole());
        System.out.println("[포상 추천] 권한 체크 - 사용자: " + emp.getEmpName() + ", 직급: " + emp.getEmpRole() + ", 권한 여부: " + hasPermission);

        return hasPermission;
    }

    /**
     * 추천 가능한 사원 목록 조회
     * CEO: 각 팀의 LEADER들
     * LEADER: 자기 팀의 팀원(LEADER 제외)
     */
    @Transactional(readOnly = true)
    public List<NomineeDTO> getNominees(String email) {
        Emp nominator = empRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        String empRole = nominator.getEmpRole();

        System.out.println("[포상 추천] 추천 가능한 사원 조회 - 추천자: " + nominator.getEmpName() + ", 직급: " + empRole);

        if ("CEO".equals(empRole)) {
            // CEO는 각 팀의 LEADER들을 추천할 수 있음
            return empRepository.findAll().stream()
                    .filter(emp -> "LEADER".equals(emp.getEmpRole()))
                    .map(this::convertToNomineeDTO)
                    .collect(Collectors.toList());
        } else if ("LEADER".equals(empRole)) {
            // LEADER는 자기 팀의 팀원만 추천할 수 있음 (LEADER 제외)
            Integer deptNo = nominator.getDept() != null ? nominator.getDept().getDeptNo() : null;
            if (deptNo == null) {
                System.out.println("[포상 추천] LEADER의 부서 정보 없음");
                return List.of();
            }

            return empRepository.findAll().stream()
                    .filter(emp -> emp.getDept() != null && deptNo.equals(emp.getDept().getDeptNo()))
                    .filter(emp -> !"LEADER".equals(emp.getEmpRole()) && !"CEO".equals(emp.getEmpRole()))
                    .filter(emp -> !emp.getEmpId().equals(nominator.getEmpId()))
                    .map(this::convertToNomineeDTO)
                    .collect(Collectors.toList());
        } else {
            System.out.println("[포상 추천] 권한 없음 - 직급: " + empRole);
            return List.of();
        }
    }

    /**
     * 포상 후보 추천 등록
     */
    @Transactional
    public Long nominateCandidate(String nominatorEmail, RewardCandidateDTO dto) {
        // 추천자 정보 조회
        Emp nominator = empRepository.findByEmail(nominatorEmail)
                .orElseThrow(() -> new IllegalArgumentException("추천자를 찾을 수 없습니다."));

        // 권한 체크
        if (!hasNominationPermission(nominatorEmail)) {
            throw new IllegalArgumentException("추천 권한이 없습니다.");
        }

        // 피추천자 정보 조회
        Emp nominee = empRepository.findById(dto.getNomineeId())
                .orElseThrow(() -> new IllegalArgumentException("피추천자를 찾을 수 없습니다."));

        // 추천 가능한 대상인지 확인
        if (!canNominate(nominator, nominee)) {
            throw new IllegalArgumentException("해당 사원을 추천할 수 없습니다.");
        }

        // 포상 정책 확인
        RewardPolicy policy = policyRepository.findById(dto.getPolicyId())
                .orElseThrow(() -> new IllegalArgumentException("포상 정책을 찾을 수 없습니다."));

        if (!"Y".equals(policy.getIsActive())) {
            throw new IllegalArgumentException("활성화되지 않은 포상 정책입니다.");
        }

        // 추천 등록
        RewardCandidate candidate = RewardCandidate.builder()
                .policyId(dto.getPolicyId())
                .nominatorId(nominator.getEmpId())
                .nomineeId(nominee.getEmpId())
                .nominationType(dto.getNominationType() != null ? dto.getNominationType() : "MANUAL")
                .reason(dto.getReason())
                .rewardAmount(dto.getRewardAmount())
                .status("PENDING")
                .build();

        RewardCandidate saved = candidateRepository.save(candidate);

        System.out.println("[포상 추천] 추천 등록 완료 - 추천자: " + nominator.getEmpName() +
                ", 피추천자: " + nominee.getEmpName() + ", 포상: " + policy.getPolicyName());

        return saved.getCandidateId();
    }

    /**
     * 추천 가능 여부 확인
     */
    private boolean canNominate(Emp nominator, Emp nominee) {
        String nominatorRole = nominator.getEmpRole();

        if ("CEO".equals(nominatorRole)) {
            // CEO는 LEADER만 추천 가능
            return "LEADER".equals(nominee.getEmpRole());
        } else if ("LEADER".equals(nominatorRole)) {
            // LEADER는 자기 팀의 팀원만 추천 가능 (LEADER, CEO 제외)
            Integer nominatorDeptNo = nominator.getDept() != null ? nominator.getDept().getDeptNo() : null;
            Integer nomineeDeptNo = nominee.getDept() != null ? nominee.getDept().getDeptNo() : null;

            if (nominatorDeptNo == null || nomineeDeptNo == null) {
                return false;
            }

            return nominatorDeptNo.equals(nomineeDeptNo)
                    && !"LEADER".equals(nominee.getEmpRole())
                    && !"CEO".equals(nominee.getEmpRole());
        }

        return false;
    }

    /**
     * 추천 목록 조회 (추천자별)
     */
    @Transactional(readOnly = true)
    public List<RewardCandidateDTO> getCandidatesByNominator(String nominatorId) {
        return candidateRepository.findByNominatorId(nominatorId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * 추천 목록 조회 (피추천자별)
     */
    @Transactional(readOnly = true)
    public List<RewardCandidateDTO> getCandidatesByNominee(String nomineeId) {
        return candidateRepository.findByNomineeId(nomineeId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * 추천 목록 조회 (전체)
     */
    @Transactional(readOnly = true)
    public List<RewardCandidateDTO> getAllCandidates() {
        return candidateRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * 본인의 승인된 포상 이력 조회
     */
    @Transactional(readOnly = true)
    public List<RewardCandidateDTO> getMyApprovedRewards(String email) {
        Emp emp = empRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        System.out.println("[포상 이력] 승인된 포상 조회 - 사용자: " + emp.getEmpName() + ", 사원번호: " + emp.getEmpId());

        return candidateRepository.findByNomineeIdAndStatus(emp.getEmpId(), "APPROVED").stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Entity to DTO 변환
     */
    private RewardCandidateDTO convertToDTO(RewardCandidate candidate) {
        RewardPolicy policy = policyRepository.findById(candidate.getPolicyId()).orElse(null);
        Emp nominator = empRepository.findById(candidate.getNominatorId()).orElse(null);
        Emp nominee = empRepository.findById(candidate.getNomineeId()).orElse(null);

        return RewardCandidateDTO.builder()
                .candidateId(candidate.getCandidateId())
                .policyId(candidate.getPolicyId())
                .policyName(policy != null ? policy.getPolicyName() : null)
                .nominatorId(candidate.getNominatorId())
                .nominatorName(nominator != null ? nominator.getEmpName() : null)
                .nomineeId(candidate.getNomineeId())
                .nomineeName(nominee != null ? nominee.getEmpName() : null)
                .nominationType(candidate.getNominationType())
                .reason(candidate.getReason())
                .rewardAmount(candidate.getRewardAmount())
                .status(candidate.getStatus())
                .createdAt(candidate.getCreatedAt())
                .updatedAt(candidate.getUpdatedAt())
                .build();
    }

    /**
     * Emp to NomineeDTO 변환
     */
    private NomineeDTO convertToNomineeDTO(Emp emp) {
        return NomineeDTO.builder()
                .empId(emp.getEmpId())
                .empName(emp.getEmpName())
                .empRole(emp.getEmpRole())
                .deptNo(emp.getDept() != null ? emp.getDept().getDeptNo() : null)
                .deptName(emp.getDept() != null ? emp.getDept().getDeptName() : null)
                .build();
    }
}