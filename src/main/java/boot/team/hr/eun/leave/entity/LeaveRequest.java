package boot.team.hr.eun.leave.entity;

import boot.team.hr.eun.leave.enums.ApprovalStatus;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "LEAVE_REQUEST")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "leave_request_seq")
    private Long leaveId;

    @Column(name = "employee_id")
    private String employeeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leave_type_id")
    private LeaveType leaveType;

    private LocalDate startDate;
    private LocalDate endDate;
    private Integer leaveMinutes;

    @Enumerated(EnumType.STRING)
    private ApprovalStatus approvalStatus;

    private String leaveReason;
    private String managerId;

    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;

    /* ===============================
       생성 메서드
    =============================== */
    public static LeaveRequest create(
            String employeeId,
            LeaveType leaveType,
            LocalDate startDate,
            LocalDate endDate,
            Integer leaveMinutes,
            String reason
    ) {
        LeaveRequest r = new LeaveRequest();
        r.employeeId = employeeId;
        r.leaveType = leaveType;
        r.startDate = startDate;
        r.endDate = endDate;
        r.leaveMinutes = leaveMinutes;
        r.leaveReason = reason;
        r.approvalStatus = ApprovalStatus.PENDING;
        r.createdAt = LocalDateTime.now();
        return r;
    }

    /* ===============================
       승인
    =============================== */
    public void approve(String managerId) {
        if (this.approvalStatus != ApprovalStatus.PENDING) {
            throw new IllegalStateException("이미 처리된 휴가입니다.");
        }
        this.approvalStatus = ApprovalStatus.APPROVED;
        this.managerId = managerId;
        this.approvedAt = LocalDateTime.now();
    }

    /* ===============================
       반려
    =============================== */
    public void reject(String managerId) {
        if (this.approvalStatus != ApprovalStatus.PENDING) {
            throw new IllegalStateException("이미 처리된 휴가입니다.");
        }
        this.approvalStatus = ApprovalStatus.REJECTED;
        this.managerId = managerId;
        this.approvedAt = LocalDateTime.now();
    }
}

