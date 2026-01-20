package boot.team.hr.hyun.emp.repo;

import boot.team.hr.hyun.emp.entity.EmpHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmpHistoryRepository extends JpaRepository<EmpHistory,Long> {
    List<EmpHistory> findByEmpIdOrderByCreatedAtDesc(String empId);
}
