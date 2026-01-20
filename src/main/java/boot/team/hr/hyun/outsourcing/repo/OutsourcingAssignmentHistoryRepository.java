package boot.team.hr.hyun.outsourcing.repo;

import boot.team.hr.hyun.outsourcing.entity.OutsourcingAssignmentHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OutsourcingAssignmentHistoryRepository extends JpaRepository<OutsourcingAssignmentHistory, Long> {
    List<OutsourcingAssignmentHistory> findByAssignmentIdOrderByCreatedAtDesc(Long assignmentId);
}