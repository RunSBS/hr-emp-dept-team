package boot.team.hr.eun.payroll.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class PayrollMonthlyListItemDto {

    private String empId;
    private LocalDate payMonth;

    private Integer annualSalary;
    private Integer baseSalary;

    private Integer totalNormalMinutes;
    private Integer totalUnpaidMinutes;
    private Integer totalSalary;

    private Integer totalOvertimeMinutes;
    private Integer totalOvAmount;

    private Integer grandTotal;
}
