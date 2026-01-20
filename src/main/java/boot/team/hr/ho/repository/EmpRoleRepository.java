package boot.team.hr.ho.repository;

import boot.team.hr.hyun.emp.entity.Emp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmpRoleRepository extends JpaRepository<Emp, String> {

    // 사원 단건 조회
    Optional<Emp> findByEmpId(String empId);

    // 특정 역할의 최상위 1명 (본부장, CEO 등)
    Optional<Emp> findFirstByEmpRole(String empRole);
}
