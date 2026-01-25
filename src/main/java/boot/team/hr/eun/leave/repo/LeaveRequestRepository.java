package boot.team.hr.eun.leave.repo;

import boot.team.hr.eun.leave.entity.LeaveRequest;
import boot.team.hr.eun.leave.enums.ApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    List<LeaveRequest> findByEmployeeIdOrderByCreatedAtDesc(String employeeId);
    List<LeaveRequest> findByApprovalStatusOrderByCreatedAtDesc(ApprovalStatus status);

    // 휴가(연차, 병가, 무급휴가) 승인을 받은 사원 조회
    @Query("""
    select case when count(lr.leaveId) > 0 then true else false end
    from LeaveRequest lr
    where lr.employeeId = :empId
      and lr.approvalStatus = 'APPROVED'
      and :workDate between lr.startDate and lr.endDate
      and lr.leaveType.leaveTypeId in (1, 3)
""")
    boolean existsApprovedPaidLeave(
            @Param("empId") String empId,
            @Param("workDate") LocalDate workDate
    );

    @Query("""
    select case when count(lr.leaveId) > 0 then true else false end
    from LeaveRequest lr
    where lr.employeeId = :empId
      and lr.approvalStatus = 'APPROVED'
      and :workDate between lr.startDate and lr.endDate
      and lr.leaveType.leaveTypeId = 4
""")
    boolean existsApprovedUnpaidLeave(
            @Param("empId") String empId,
            @Param("workDate") LocalDate workDate
    );



}

