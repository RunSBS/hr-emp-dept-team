package boot.team.hr.eun.payroll.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(
        name = "SALARY",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"EMPLOYEE_ID", "PAY_MONTH"})
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Salary {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "salary_seq")
    @SequenceGenerator(name = "salary_seq", sequenceName = "SALARY_SEQ", allocationSize = 1)
    @Column(name = "SALARY_ID")
    private Long salaryId;

    @Column(name = "EMPLOYEE_ID", nullable = false, length = 225)
    private String employeeId;

    @Column(name = "PAY_MONTH", nullable = false)
    private LocalDate payMonth; // 항상 1일

    @Column(name = "ANNUAL_SALARY")
    private Integer annualSalary;

    @Column(name = "BASE_SALARY")
    private Integer baseSalary;

    @Column(name = "TOTAL_NORMAL_MINUTES")
    private Integer totalNormalMinutes;

    @Column(name = "TOTAL_UNPAID_MINUTES")
    private Integer totalUnpaidMinutes;

    @Column(name = "TOTAL_SALARY")
    private Integer totalSalary;

    public static Salary create(String empId, LocalDate payMonth) {
        return Salary.builder()
                .employeeId(empId)
                .payMonth(payMonth)
                .annualSalary(0)
                .baseSalary(0)
                .totalNormalMinutes(0)
                .totalUnpaidMinutes(0)
                .totalSalary(0)
                .build();
    }

    public void changeSalaryInfo(Integer annualSalary, Integer baseSalary) {
        this.annualSalary = annualSalary;
        this.baseSalary = baseSalary;
    }

    public void applyMonthlyTotals(Integer totalNormalMinutes, Integer totalUnpaidMinutes, Integer totalSalary) {
        this.totalNormalMinutes = totalNormalMinutes;
        this.totalUnpaidMinutes = totalUnpaidMinutes;
        this.totalSalary = totalSalary;
    }
}
