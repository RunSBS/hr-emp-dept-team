package boot.team.hr.min.project.repository;

import boot.team.hr.min.project.entitiy.PhaseDeliver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhaseDeliverRepository extends JpaRepository<PhaseDeliver, Long> {
    List<PhaseDeliver> findByProjectPhase_Id(Long phaseId);
}
