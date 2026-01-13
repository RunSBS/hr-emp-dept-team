package boot.team.hr.gyu.repository;

import boot.team.hr.gyu.entity.EvaluationScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluationScoreRepository extends JpaRepository<EvaluationScore, Long> {

    // 특정 평가의 모든 점수 조회
    List<EvaluationScore> findByEvaluationId(Long evaluationId);
}