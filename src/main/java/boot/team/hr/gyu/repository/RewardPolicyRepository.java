package boot.team.hr.gyu.repository;

import boot.team.hr.gyu.entity.RewardPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RewardPolicyRepository extends JpaRepository<RewardPolicy, Long> {

    // 정책명으로 조회
    List<RewardPolicy> findByPolicyName(String policyName);

    // 정책명 중복 확인
    boolean existsByPolicyName(String policyName);

    // 활성화 상태로 조회
    List<RewardPolicy> findByIsActive(Boolean isActive);

    // 포상 유형으로 조회
    List<RewardPolicy> findByRewardType(String rewardType);

    // 생성일 기준 정렬 조회
    List<RewardPolicy> findAllByOrderByCreatedAtDesc();
}