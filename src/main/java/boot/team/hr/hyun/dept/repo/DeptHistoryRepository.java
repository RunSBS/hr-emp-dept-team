package boot.team.hr.hyun.dept.repo;

import boot.team.hr.hyun.dept.entity.DeptHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DeptHistoryRepository extends JpaRepository<DeptHistory,Long>{
    List<DeptHistory> findByDeptNoOrderByCreatedAtDesc(Integer deptNo);
}
