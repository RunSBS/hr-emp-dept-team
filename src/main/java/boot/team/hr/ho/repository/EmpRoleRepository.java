package boot.team.hr.ho.repository;

import boot.team.hr.hyun.emp.entity.Emp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmpRoleRepository extends JpaRepository<Emp, String> {

    Optional<Emp> findByEmpId(String empId);

    Optional<Emp> findFirstByEmpRole(EmpRole empRole);
}

