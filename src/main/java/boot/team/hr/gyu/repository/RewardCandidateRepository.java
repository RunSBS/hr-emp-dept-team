package boot.team.hr.gyu.repository;

import boot.team.hr.gyu.entity.RewardCandidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RewardCandidateRepository extends JpaRepository<RewardCandidate, Long> {
    List<RewardCandidate> findByNominatorId(String nominatorId);
    List<RewardCandidate> findByNomineeId(String nomineeId);
    List<RewardCandidate> findByPolicyId(Long policyId);
    List<RewardCandidate> findByNomineeIdAndStatus(String nomineeId, String status);
}