package boot.team.hr.gyu.repository;

import boot.team.hr.gyu.entity.RewardPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RewardPolicyRepository extends JpaRepository<RewardPolicy, Long> {
}