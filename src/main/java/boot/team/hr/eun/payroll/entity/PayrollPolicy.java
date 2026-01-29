package boot.team.hr.eun.payroll.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "PAYROLL_POLICY")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayrollPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "payroll_policy_seq")
    @SequenceGenerator(name = "payroll_policy_seq", sequenceName = "PAYROLL_POLICY_SEQ", allocationSize = 1)
    @Column(name = "PAYROLL_POLICY_ID")
    private Long payrollPolicyId;

    @Column(name = "RATE_MULTIPLIER", precision = 4, scale = 2, nullable = false)
    private java.math.BigDecimal rateMultiplier;

    @Column(name = "WORK_MINUTES_PER_MONTH", nullable = false)
    private Integer workMinutesPerMonth;

    @Column(name = "DESCRIPTION", length = 200)
    private String description;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

    @Column(name = "UPDATED_AT")
    private LocalDate updatedAt;
}
