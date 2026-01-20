package boot.team.hr.ho.repository;
import boot.team.hr.ho.entity.ApprovalLinePolicy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApprovalLinePolicyRepository
        extends JpaRepository<ApprovalLinePolicy, Long> {

    List<ApprovalLinePolicy> findByTypeIdOrderByStepOrder(Long typeId);
}

