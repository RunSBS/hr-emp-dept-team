package boot.team.hr.gyu.repository;

import boot.team.hr.gyu.entity.EvaluationCriteria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluationCriteriaRepository extends JpaRepository<EvaluationCriteria, Long> {

    // 항목명으로 조회
    List<EvaluationCriteria> findByCriteriaName(String criteriaName);

    // 항목명 중복 확인
    boolean existsByCriteriaName(String criteriaName);

    // 생성일 기준 정렬 조회
    List<EvaluationCriteria> findAllByOrderByCreatedAtDesc();
}