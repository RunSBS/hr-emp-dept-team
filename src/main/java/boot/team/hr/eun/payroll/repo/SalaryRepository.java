package boot.team.hr.eun.payroll.repo;

import boot.team.hr.eun.payroll.entity.Salary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface SalaryRepository extends JpaRepository<Salary, Long> {
    Optional<Salary> findByEmployeeIdAndPayMonth(String employeeId, LocalDate payMonth);
    List<Salary> findAllByPayMonth(LocalDate payMonth);
}
