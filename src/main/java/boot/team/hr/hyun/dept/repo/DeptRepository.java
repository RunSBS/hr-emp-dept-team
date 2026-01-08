package boot.team.hr.hyun.dept.repo;

import boot.team.hr.hyun.dept.entity.Dept;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DeptRepository extends JpaRepository<Dept,Long> {
    void deleteDeptByDeptId(Integer deptId);
    Optional<Dept> findByDeptId(Integer deptId);
}
