package boot.team.hr.gyu.service;

import boot.team.hr.gyu.dto.CurrentUserDTO;
import boot.team.hr.gyu.dto.EvaluationCriteriaDTO;
import boot.team.hr.gyu.entity.EvaluationCriteria;
import boot.team.hr.gyu.repository.EvaluationCriteriaRepository;
import boot.team.hr.hyun.emp.entity.Emp;
import boot.team.hr.hyun.emp.repo.EmpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EvaluationCriteriaService {

    private final EvaluationCriteriaRepository criteriaRepository;
    private final EmpRepository empRepository;

    /**
     * 현재 로그인 사용자 정보 조회
     */
    public CurrentUserDTO getCurrentUser(String email) {
        Emp emp = empRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        System.out.println("[평가항목관리] 사용자 조회 - 이메일: " + email + ", 이름: " + emp.getEmpName() + ", 직급: " + emp.getEmpRole());

        return CurrentUserDTO.builder()
                .id(emp.getId())
                .empId(emp.getEmpId())
                .empName(emp.getEmpName())
                .deptId(emp.getDeptId())
                .email(emp.getEmail())
                .empRole(emp.getEmpRole())
                .build();
    }

    /**
     * 평가 항목 관리 권한 체크 (empRole == "EVAL" 또는 "CEO"만 가능)
     */
    public boolean hasManagementPermission(String email) {
        Emp emp = empRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        boolean hasPermission = "EVAL".equals(emp.getEmpRole()) || "CEO".equals(emp.getEmpRole());
        System.out.println("[평가항목관리] 권한 체크 - 사용자: " + emp.getEmpName() + ", 직급: " + emp.getEmpRole() + ", 권한 여부: " + hasPermission);

        return hasPermission;
    }

    @Transactional(readOnly = true)
    public List<EvaluationCriteriaDTO> getAllCriteria() {
        return criteriaRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EvaluationCriteriaDTO getCriteriaById(Long id) {
        EvaluationCriteria criteria = criteriaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("평가 항목을 찾을 수 없습니다."));
        return convertToDTO(criteria);
    }

    @Transactional
    public Long createCriteria(EvaluationCriteriaDTO dto) {
        EvaluationCriteria criteria = EvaluationCriteria.builder()
                .criteriaName(dto.getCriteriaName())
                .weight(dto.getWeight())
                .description(dto.getDescription())
                .build();

        return criteriaRepository.save(criteria).getCriteriaId();
    }

    @Transactional
    public void updateCriteria(Long id, EvaluationCriteriaDTO dto) {
        EvaluationCriteria criteria = criteriaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("평가 항목을 찾을 수 없습니다."));

        criteria.setCriteriaName(dto.getCriteriaName());
        criteria.setWeight(dto.getWeight());
        criteria.setDescription(dto.getDescription());

        criteriaRepository.save(criteria);
    }

    @Transactional
    public void deleteCriteria(Long id) {
        if (!criteriaRepository.existsById(id)) {
            throw new IllegalArgumentException("평가 항목을 찾을 수 없습니다.");
        }
        criteriaRepository.deleteById(id);
    }

    private EvaluationCriteriaDTO convertToDTO(EvaluationCriteria criteria) {
        return EvaluationCriteriaDTO.builder()
                .criteriaId(criteria.getCriteriaId())
                .criteriaName(criteria.getCriteriaName())
                .weight(criteria.getWeight())
                .description(criteria.getDescription())
                .createdAt(criteria.getCreatedAt())
                .build();
    }
}