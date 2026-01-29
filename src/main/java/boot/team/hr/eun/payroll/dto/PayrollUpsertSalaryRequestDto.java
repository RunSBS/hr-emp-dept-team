package boot.team.hr.eun.payroll.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PayrollUpsertSalaryRequestDto {

    private String empId;      // VARCHAR2(225)
    private String payMonth;   // "YYYY-MM-DD" (항상 1일)
    private Integer annualSalary;
    private Integer baseSalary;
}
