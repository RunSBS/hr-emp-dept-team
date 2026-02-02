package boot.team.hr.eun.payroll.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(
        name = "OVERTIME_ALLOWANCE",
        uniqueConstraints = @UniqueConstraint(columnNames = {"EMPLOYEE_ID", "PAY_MONTH"})
)
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OvertimeAllowance {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "ov_allowance_seq")
    @SequenceGenerator(name = "ov_allowance_seq", sequenceName = "OVERTIME_ALLOWANCE_SEQ", allocationSize = 1)
    @Column(name = "OV_ALLOWANCE_ID")
    private Long ovAllowanceId;

    @Column(name = "EMPLOYEE_ID", nullable = false, length = 225)
    private String employeeId;

    @Column(name = "PAY_MONTH", nullable = false)
    private LocalDate payMonth; // 항상 1일

    @Column(name = "TOTAL_OVERTIME_MINUTES")
    private Integer totalOvertimeMinutes;

    @Column(name = "TOTAL_OV_AMOUNT")
    private Integer totalOvAmount;

    public static OvertimeAllowance create(String empId, LocalDate payMonth) {
        return OvertimeAllowance.builder()
                .employeeId(empId)
                .payMonth(payMonth)
                .totalOvertimeMinutes(0)
                .totalOvAmount(0)
                .build();
    }

    public void applyTotals(int overtimeMinutes, int ovAmount) {
        this.totalOvertimeMinutes = overtimeMinutes;
        this.totalOvAmount = ovAmount;
    }
}
