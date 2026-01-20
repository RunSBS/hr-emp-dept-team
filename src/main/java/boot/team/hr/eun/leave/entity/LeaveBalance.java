package boot.team.hr.eun.leave.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Year;

@Entity
@Table(name = "LEAVE_BALANCE")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class LeaveBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "leave_balance_seq")
    @SequenceGenerator(
            name = "leave_balance_seq",
            sequenceName = "leave_balance_seq",
            allocationSize = 1
    )
    private Long balanceId;

    @Column(nullable = false)
    private String employeeId;

    @Column(name = "leave_year", nullable = false)
    private Integer leaveYear;

    @Column(nullable = false)
    private Integer totalLeaveMinutes;

    @Column(nullable = false)
    private Integer usedLeaveMinutes;

    @Column(nullable = false)
    private Integer remainingLeaveMinutes;

    /* ===============================
       연차 최초 생성 (연도 포함)
    =============================== */
    public static LeaveBalance create(String employeeId, int year, int totalMinutes) {
        LeaveBalance b = new LeaveBalance();
        b.employeeId = employeeId;
        b.leaveYear = year;
        b.totalLeaveMinutes = totalMinutes;
        b.usedLeaveMinutes = 0;
        b.remainingLeaveMinutes = totalMinutes;
        return b;
    }

    /* ===============================
       연차 사용
    =============================== */
    public void useLeave(int minutes) {
        if (remainingLeaveMinutes < minutes) {
            throw new IllegalStateException("잔여 연차가 부족합니다.");
        }
        this.usedLeaveMinutes += minutes;
        this.remainingLeaveMinutes -= minutes;
    }

    /* ===============================
       연차 수정 (관리자)
    =============================== */
    public void updateTotalLeave(int totalMinutes) {
        if (totalMinutes < this.usedLeaveMinutes) {
            throw new IllegalArgumentException("총 연차는 사용 연차보다 작을 수 없습니다.");
        }
        this.totalLeaveMinutes = totalMinutes;
        this.remainingLeaveMinutes = totalMinutes - this.usedLeaveMinutes;
    }
}
