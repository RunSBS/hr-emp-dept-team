package boot.team.hr.gyu.repository;

import boot.team.hr.gyu.entity.EvaluationResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluationResultRepository extends JpaRepository<EvaluationResult, Long> {

    // 특정 직원의 평가 결과 조회
    List<EvaluationResult> findByEmpIdOrderByCreatedAtDesc(String empId);

    // 특정 평가자가 작성한 평가 결과 조회
    List<EvaluationResult> findByEvaluatorIdOrderByCreatedAtDesc(String evaluatorId);

    // 특정 평가 기간의 평가 결과 조회
    List<EvaluationResult> findByEvaluationPeriodOrderByTotalScoreDesc(String evaluationPeriod);

    // 특정 직원의 특정 기간 평가 결과 조회
    List<EvaluationResult> findByEmpIdAndEvaluationPeriod(String empId, String evaluationPeriod);
}