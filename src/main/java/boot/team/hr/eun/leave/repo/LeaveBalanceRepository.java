package boot.team.hr.eun.leave.repo;

import boot.team.hr.eun.leave.entity.LeaveBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Long> {

    List<LeaveBalance> findByEmployeeId(String employeeId);

    Optional<LeaveBalance> findByEmployeeIdAndLeaveYear(String employeeId, Integer leaveYear);

    List<LeaveBalance> findByLeaveYear(Integer leaveYear);

    @Query("select distinct b.leaveYear from LeaveBalance b order by b.leaveYear desc")
    List<Integer> findDistinctLeaveYears();
}
