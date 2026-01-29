package boot.team.hr.eun.payroll.repo;

import boot.team.hr.eun.payroll.entity.OvertimeAllowance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface OvertimeAllowanceRepository extends JpaRepository<OvertimeAllowance, Long> {
    Optional<OvertimeAllowance> findByEmployeeIdAndPayMonth(String employeeId, LocalDate payMonth);
}
