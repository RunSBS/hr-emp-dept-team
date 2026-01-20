package boot.team.hr.eun.leave.repo;

import boot.team.hr.eun.leave.entity.LeaveRequest;
import boot.team.hr.eun.leave.enums.ApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    List<LeaveRequest> findByEmployeeIdOrderByCreatedAtDesc(String employeeId);
    List<LeaveRequest> findByApprovalStatusOrderByCreatedAtDesc(ApprovalStatus status);



}

