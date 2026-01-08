package boot.team.hr.hyun.repo;

import boot.team.hr.hyun.entity.Emp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmpRepository extends JpaRepository<Emp,Long> {
    Optional<Emp> findByEmail(String email);
}
