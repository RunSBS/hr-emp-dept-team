package boot.team.hr.hyun.repo;

import boot.team.hr.hyun.entity.Emp;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmpRepository extends JpaRepository<Emp,Long> {
}
