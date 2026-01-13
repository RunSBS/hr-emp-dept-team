package boot.team.hr.gyu.service;

import boot.team.hr.gyu.dto.EvaluationResultDTO;
import boot.team.hr.gyu.dto.EvaluationScoreDTO;
import boot.team.hr.gyu.entity.EvaluationCriteria;
import boot.team.hr.gyu.entity.EvaluationResult;
import boot.team.hr.gyu.entity.EvaluationScore;
import boot.team.hr.gyu.repository.EvaluationCriteriaRepository;
import boot.team.hr.gyu.repository.EvaluationResultRepository;
import boot.team.hr.gyu.repository.EvaluationScoreRepository;
import boot.team.hr.hyun.emp.entity.Emp;
import boot.team.hr.hyun.emp.repo.EmpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EvaluationResultService {

    private final EvaluationResultRepository resultRepository;
    private final EvaluationScoreRepository scoreRepository;
    private final EvaluationCriteriaRepository criteriaRepository;
    private final EmpRepository empRepository;

    /**
     * 현재 로그인한 사용자의 평가 결과 조회
     */
    @Transactional(readOnly = true)
    public List<EvaluationResultDTO> getMyEvaluations(String email) {
        Emp emp = empRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        return getEvaluationsByEmpId(emp.getEmpId());
    }

    /**
     * 특정 직원의 평가 결과 조회
     */
    @Transactional(readOnly = true)
    public List<EvaluationResultDTO> getEvaluationsByEmpId(String empId) {
        List<EvaluationResult> results = resultRepository.findByEmpIdOrderByCreatedAtDesc(empId);
        return results.stream()
                .map(this::convertToDetailedDTO)
                .collect(Collectors.toList());
    }

    /**
     * 특정 평가 결과 상세 조회
     */
    @Transactional(readOnly = true)
    public EvaluationResultDTO getEvaluationById(Long evaluationId) {
        EvaluationResult result = resultRepository.findById(evaluationId)
                .orElseThrow(() -> new IllegalArgumentException("평가 결과를 찾을 수 없습니다."));
        return convertToDetailedDTO(result);
    }

    /**
     * 특정 기간의 모든 평가 결과 조회
     */
    @Transactional(readOnly = true)
    public List<EvaluationResultDTO> getEvaluationsByPeriod(String period) {
        List<EvaluationResult> results = resultRepository.findByEvaluationPeriodOrderByTotalScoreDesc(period);
        return results.stream()
                .map(this::convertToDetailedDTO)
                .collect(Collectors.toList());
    }

    /**
     * EvaluationResult를 상세 DTO로 변환
     */
    private EvaluationResultDTO convertToDetailedDTO(EvaluationResult result) {
        // 직원 정보 조회
        Emp emp = empRepository.findByEmpId(result.getEmpId())
                .orElse(null);
        Emp evaluator = empRepository.findByEmpId(result.getEvaluatorId())
                .orElse(null);

        // 평가 항목별 점수 조회
        List<EvaluationScore> scores = scoreRepository.findByEvaluationId(result.getEvaluationId());
        Map<Long, EvaluationCriteria> criteriaMap = criteriaRepository.findAll().stream()
                .collect(Collectors.toMap(EvaluationCriteria::getCriteriaId, c -> c));

        List<EvaluationScoreDTO> scoreDTOs = scores.stream()
                .map(score -> {
                    EvaluationCriteria criteria = criteriaMap.get(score.getCriteriaId());
                    return EvaluationScoreDTO.builder()
                            .detailId(score.getDetailId())
                            .evaluationId(score.getEvaluationId())
                            .criteriaId(score.getCriteriaId())
                            .criteriaName(criteria != null ? criteria.getCriteriaName() : "")
                            .weight(criteria != null ? criteria.getWeight() : 0)
                            .score(score.getScore())
                            .weightedScore(score.getScore() * (criteria != null ? criteria.getWeight() : 0) / 100)
                            .build();
                })
                .collect(Collectors.toList());

        // 등급 계산
        String grade = calculateGrade(result.getTotalScore());

        return EvaluationResultDTO.builder()
                .evaluationId(result.getEvaluationId())
                .empId(result.getEmpId())
                .empName(emp != null ? emp.getEmpName() : "")
                .evaluatorId(result.getEvaluatorId())
                .evaluatorName(evaluator != null ? evaluator.getEmpName() : "")
                .totalScore(result.getTotalScore())
                .evaluationPeriod(result.getEvaluationPeriod())
                .comment(result.getComment())
                .createdAt(result.getCreatedAt())
                .scores(scoreDTOs)
                .grade(grade)
                .build();
    }

    /**
     * 점수에 따른 등급 계산
     */
    private String calculateGrade(Integer totalScore) {
        if (totalScore == null) return "C";
        if (totalScore >= 90) return "S";
        if (totalScore >= 80) return "A";
        if (totalScore >= 70) return "B";
        return "C";
    }
}