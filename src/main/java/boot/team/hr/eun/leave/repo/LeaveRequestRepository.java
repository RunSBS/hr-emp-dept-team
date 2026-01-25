package boot.team.hr.eun.leave.repo;

import boot.team.hr.eun.leave.entity.LeaveRequest;
import boot.team.hr.eun.leave.enums.ApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    // 유급(1 연차, 3 병가)
    @Query("""
        SELECT CASE WHEN COUNT(l) > 0 THEN true ELSE false END
        FROM LeaveRequest l
        WHERE l.employeeId = :empId
          AND l.approvalStatus = 'APPROVED'
          AND :workDate BETWEEN l.startDate AND l.endDate
          AND l.leaveType.leaveTypeId IN (1,3)
          AND :workDate BETWEEN l.startDate AND l.endDate
    """)
    boolean existsApprovedPaidLeave(
            @Param("empId") String empId,
            @Param("workDate") LocalDate workDate
    );

    // 무급(4 무급휴가)
    @Query("""
        SELECT CASE WHEN COUNT(l) > 0 THEN true ELSE false END
        FROM LeaveRequest l
        WHERE l.employeeId = :empId
          AND l.approvalStatus = 'APPROVED'
          AND :workDate BETWEEN l.startDate AND l.endDate
          AND l.leaveType.leaveTypeId IN (4)
          AND :workDate BETWEEN l.startDate AND l.endDate
    """)
    boolean existsApprovedUnpaidLeave(
            @Param("empId") String empId,
            @Param("workDate") LocalDate workDate
    );

    // AM 반차(leave_type_id = 5)
    @Query("""
    select case when count(lr.leaveId) > 0 then true else false end
    from LeaveRequest lr
    where lr.employeeId = :empId
      and lr.approvalStatus = 'APPROVED'
      and :workDate between lr.startDate and lr.endDate
      and lr.leaveType.leaveTypeId = 5
    """)
    boolean existsApprovedAmHalfLeave(
            @Param("empId") String empId,
            @Param("workDate") LocalDate workDate
    );

    // Attendance 패키지에서 쓰기 편하도록 별칭 메서드 제공
    default boolean existsApprovedAmLeave(String empId, LocalDate workDate) {
        return existsApprovedAmHalfLeave(empId, workDate);
    }

    // PM 반차(leave_type_id = 6)
    @Query("""
    select case when count(lr.leaveId) > 0 then true else false end
    from LeaveRequest lr
    where lr.employeeId = :empId
      and lr.approvalStatus = 'APPROVED'
      and :workDate between lr.startDate and lr.endDate
      and lr.leaveType.leaveTypeId = 6
    """)
    boolean existsApprovedPmHalfLeave(
            @Param("empId") String empId,
            @Param("workDate") LocalDate workDate
    );

    default boolean existsApprovedPmLeave(String empId, LocalDate workDate) {
        return existsApprovedPmHalfLeave(empId, workDate);
    }

    List<LeaveRequest> findByApprovalStatusOrderByCreatedAtDesc(ApprovalStatus approvalStatus);

    List<LeaveRequest> findByEmployeeIdOrderByCreatedAtDesc(String employeeId);

}
