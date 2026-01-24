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
        SELECT COUNT(l) > 0
        FROM LeaveRequest l
        WHERE l.employeeId = :empId
          AND l.approvalStatus = 'APPROVED'
          AND :workDate BETWEEN l.startDate AND l.endDate
          AND l.leaveType.leaveTypeId IN (1, 3, 4)
          AND :workDate BETWEEN l.startDate AND l.endDate
    """)
    boolean existsApprovedLeave(
            @Param("empId") String empId,
            @Param("workDate") LocalDate workDate
    );



}

