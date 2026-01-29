package boot.team.hr.eun.payroll.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PayrollPolicyUpdateRequestDto {

    private Double rateMultiplier;       // 예: 1.50
    private Integer workMinutesPerMonth; // 예: 9600 (선택)
    private String description;
}
