package boot.team.hr.gyu.service;

import boot.team.hr.gyu.dto.*;
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

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EvaluationInputService {

    private final EmpRepository empRepository;
    private final EvaluationResultRepository resultRepository;
    private final EvaluationScoreRepository scoreRepository;
    private final EvaluationCriteriaRepository criteriaRepository;

    /**
     * 현재 로그인 사용자 정보 조회
     */
    public CurrentUserDTO getCurrentUser(String email) {
        Emp emp = empRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        Integer deptId = null;
        if (emp.getDept() != null) {
            deptId = emp.getDept().getDeptNo(); // Dept PK
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
     * 평가 대상자 목록 조회 (권한별)
     */
    public List<EvaluationTargetDTO> getEvaluationTargets(String email) {
        Emp currentUser = empRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        List<Emp> targets = new ArrayList<>();

        if ("CEO".equals(currentUser.getEmpRole())) {
            // CEO는 LEADER 목록 조회
            targets = empRepository.findAll().stream()
                    .filter(emp -> "LEADER".equals(emp.getEmpRole()))
                    .collect(Collectors.toList());
        } else if ("LEADER".equals(currentUser.getEmpRole())) {
            // LEADER는 같은 부서의 EMP 목록 조회
            targets = empRepository.findAll().stream()
                    .filter(emp -> emp.getDept().getDeptNo() != null
                            && emp.getDept().getDeptNo().equals(currentUser.getDept().getDeptNo())
                            && "EMP".equals(emp.getEmpRole()))
                    .collect(Collectors.toList());
        }

        return targets.stream()
                .map(emp -> EvaluationTargetDTO.builder()
                        .empId(emp.getEmpId())
                        .empName(emp.getEmpName())
                        .deptId(emp.getDept().getDeptNo())
                        .empRole(emp.getEmpRole())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * 평가 권한 체크
     */
    public boolean hasEvaluationPermission(String evaluatorEmail, String targetEmpId) {
        Emp evaluator = empRepository.findByEmail(evaluatorEmail)
                .orElseThrow(() -> new IllegalArgumentException("평가자를 찾을 수 없습니다."));

        Emp target = empRepository.findById(targetEmpId)
                .orElseThrow(() -> new IllegalArgumentException("평가 대상자를 찾을 수 없습니다."));

        // CEO는 LEADER 평가 가능
        if ("CEO".equals(evaluator.getEmpRole()) && "LEADER".equals(target.getEmpRole())) {
            return true;
        }

        // LEADER는 같은 부서의 EMP 평가 가능
        if ("LEADER".equals(evaluator.getEmpRole())
                && "EMP".equals(target.getEmpRole())
                && evaluator.getDept().getDeptNo() != null
                && evaluator.getDept().getDeptNo().equals(target.getDept().getDeptNo())) {
            return true;
        }

        return false;
    }

    /**
     * 평가 입력
     */
    @Transactional
    public Long createEvaluation(String evaluatorEmail, EvaluationInputDTO inputDTO) {
        Emp evaluator = empRepository.findByEmail(evaluatorEmail)
                .orElseThrow(() -> new IllegalArgumentException("평가자를 찾을 수 없습니다."));

        // 권한 체크
        if (!hasEvaluationPermission(evaluatorEmail, inputDTO.getEmpId())) {
            throw new IllegalArgumentException("평가 권한이 없습니다.");
        }

        // 평가 항목 조회
        Map<Long, EvaluationCriteria> criteriaMap = criteriaRepository.findAll().stream()
                .collect(Collectors.toMap(EvaluationCriteria::getCriteriaId, c -> c));

        // 총점 계산
        int totalScore = 0;
        for (EvaluationScoreInputDTO scoreInput : inputDTO.getScores()) {
            EvaluationCriteria criteria = criteriaMap.get(scoreInput.getCriteriaId());
            if (criteria != null) {
                totalScore += scoreInput.getScore() * criteria.getWeight() / 100;
            }
        }

        // 평가 결과 저장
        EvaluationResult result = EvaluationResult.builder()
                .empId(inputDTO.getEmpId())
                .evaluatorId(evaluator.getEmpId())
                .totalScore(totalScore)
                .evaluationPeriod(inputDTO.getEvaluationPeriod())
                .comment(inputDTO.getComment())
                .build();

        result = resultRepository.save(result);

        // 평가 항목별 점수 저장
        for (EvaluationScoreInputDTO scoreInput : inputDTO.getScores()) {
            EvaluationScore score = EvaluationScore.builder()
                    .evaluationId(result.getEvaluationId())
                    .criteriaId(scoreInput.getCriteriaId())
                    .score(scoreInput.getScore())
                    .build();
            scoreRepository.save(score);
        }

        return result.getEvaluationId();
    }

    /**
     * 평가자가 입력한 평가 목록 조회
     */
    @Transactional(readOnly = true)
    public List<EvaluationResultDTO> getMyInputEvaluations(String email) {
        Emp evaluator = empRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("평가자를 찾을 수 없습니다."));

        System.out.println("[평가입력] 평가 목록 조회 - 평가자: " + evaluator.getEmpName() + ", 사번: " + evaluator.getEmpId());

        List<EvaluationResult> results = resultRepository.findByEvaluatorIdOrderByCreatedAtDesc(evaluator.getEmpId());

        return results.stream()
                .map(this::convertToResultDTO)
                .collect(Collectors.toList());
    }

    /**
     * 평가 상세 조회 (수정용, 권한 체크 포함)
     */
    @Transactional(readOnly = true)
    public EvaluationInputDTO getEvaluationForEdit(String evaluatorEmail, Long evaluationId) {
        Emp evaluator = empRepository.findByEmail(evaluatorEmail)
                .orElseThrow(() -> new IllegalArgumentException("평가자를 찾을 수 없습니다."));

        EvaluationResult result = resultRepository.findById(evaluationId)
                .orElseThrow(() -> new IllegalArgumentException("평가 결과를 찾을 수 없습니다."));

        // 본인이 작성한 평가인지 확인
        if (!result.getEvaluatorId().equals(evaluator.getEmpId())) {
            System.out.println("[평가입력] 평가 조회 실패 - 권한 없음, 평가자: " + evaluator.getEmpName() + ", 평가ID: " + evaluationId);
            throw new IllegalArgumentException("본인이 작성한 평가만 조회할 수 있습니다.");
        }

        System.out.println("[평가입력] 평가 상세 조회 - 평가ID: " + evaluationId + ", 평가자: " + evaluator.getEmpName());

        // 평가 항목별 점수 조회
        List<EvaluationScore> scores = scoreRepository.findByEvaluationId(evaluationId);
        List<EvaluationScoreInputDTO> scoreInputDTOs = scores.stream()
                .map(score -> EvaluationScoreInputDTO.builder()
                        .criteriaId(score.getCriteriaId())
                        .score(score.getScore())
                        .build())
                .collect(Collectors.toList());

        return EvaluationInputDTO.builder()
                .empId(result.getEmpId())
                .evaluatorId(result.getEvaluatorId())
                .evaluationPeriod(result.getEvaluationPeriod())
                .comment(result.getComment())
                .scores(scoreInputDTOs)
                .build();
    }

    /**
     * EvaluationResult를 EvaluationResultDTO로 변환
     */
    private EvaluationResultDTO convertToResultDTO(EvaluationResult result) {
        Emp emp = empRepository.findById(result.getEmpId()).orElse(null);
        Emp evaluator = empRepository.findById(result.getEvaluatorId()).orElse(null);

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

    /**
     * 평가 수정
     */
    @Transactional
    public void updateEvaluation(String evaluatorEmail, Long evaluationId, EvaluationInputDTO inputDTO) {
        Emp evaluator = empRepository.findByEmail(evaluatorEmail)
                .orElseThrow(() -> new IllegalArgumentException("평가자를 찾을 수 없습니다."));

        EvaluationResult result = resultRepository.findById(evaluationId)
                .orElseThrow(() -> new IllegalArgumentException("평가 결과를 찾을 수 없습니다."));

        // 본인이 작성한 평가인지 확인
        if (!result.getEvaluatorId().equals(evaluator.getEmpId())) {
            throw new IllegalArgumentException("본인이 작성한 평가만 수정할 수 있습니다.");
        }

        // 권한 체크
        if (!hasEvaluationPermission(evaluatorEmail, result.getEmpId())) {
            throw new IllegalArgumentException("평가 권한이 없습니다.");
        }

        // 평가 항목 조회
        Map<Long, EvaluationCriteria> criteriaMap = criteriaRepository.findAll().stream()
                .collect(Collectors.toMap(EvaluationCriteria::getCriteriaId, c -> c));

        // 총점 재계산
        int totalScore = 0;
        for (EvaluationScoreInputDTO scoreInput : inputDTO.getScores()) {
            EvaluationCriteria criteria = criteriaMap.get(scoreInput.getCriteriaId());
            if (criteria != null) {
                totalScore += scoreInput.getScore() * criteria.getWeight() / 100;
            }
        }

        // 평가 결과 수정
        result.setTotalScore(totalScore);
        result.setEvaluationPeriod(inputDTO.getEvaluationPeriod());
        result.setComment(inputDTO.getComment());
        resultRepository.save(result);

        // 기존 평가 항목 점수 삭제 후 재저장
        List<EvaluationScore> existingScores = scoreRepository.findByEvaluationId(evaluationId);
        scoreRepository.deleteAll(existingScores);

        for (EvaluationScoreInputDTO scoreInput : inputDTO.getScores()) {
            EvaluationScore score = EvaluationScore.builder()
                    .evaluationId(evaluationId)
                    .criteriaId(scoreInput.getCriteriaId())
                    .score(scoreInput.getScore())
                    .build();
            scoreRepository.save(score);
        }

        System.out.println("[평가입력] 평가 수정 완료 - 평가ID: " + evaluationId + ", 평가자: " + evaluator.getEmpName());
    }

    /**
     * 평가 삭제
     */
    @Transactional
    public void deleteEvaluation(String evaluatorEmail, Long evaluationId) {
        Emp evaluator = empRepository.findByEmail(evaluatorEmail)
                .orElseThrow(() -> new IllegalArgumentException("평가자를 찾을 수 없습니다."));

        EvaluationResult result = resultRepository.findById(evaluationId)
                .orElseThrow(() -> new IllegalArgumentException("평가 결과를 찾을 수 없습니다."));

        // 본인이 작성한 평가인지 확인
        if (!result.getEvaluatorId().equals(evaluator.getEmpId())) {
            System.out.println("[평가입력] 평가 삭제 실패 - 권한 없음, 평가자: " + evaluator.getEmpName() + ", 평가ID: " + evaluationId);
            throw new IllegalArgumentException("본인이 작성한 평가만 삭제할 수 있습니다.");
        }

        // 평가 항목별 점수 삭제
        List<EvaluationScore> scores = scoreRepository.findByEvaluationId(evaluationId);
        scoreRepository.deleteAll(scores);

        // 평가 결과 삭제
        resultRepository.delete(result);

        System.out.println("[평가입력] 평가 삭제 완료 - 평가ID: " + evaluationId + ", 평가자: " + evaluator.getEmpName() + ", 대상자: " + result.getEmpId());
    }
}