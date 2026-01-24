package boot.team.hr.hyun.emp.repo;

import boot.team.hr.hyun.emp.entity.Emp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface EmpRepository extends JpaRepository<Emp,String> {
    Optional<Emp> findByEmail(String email);
    List<Emp> findByDept_DeptNo(Integer deptNo);

    List<Emp> findByEmpIdIn(List<String> empIds);
    @Query("select e from Emp e where e.empRole = 'EMP'")
    List<Emp> findAllEmployeesOnly();


}