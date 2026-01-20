package boot.team.hr.eun.leave.repo;

import boot.team.hr.eun.leave.entity.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeaveTypeRepository extends JpaRepository<LeaveType, Long> {

    List<LeaveType> findByIsActive(String isActive);
}
