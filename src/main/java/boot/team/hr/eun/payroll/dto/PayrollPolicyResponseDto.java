package boot.team.hr.eun.payroll.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class PayrollPolicyResponseDto {

    private Long payrollPolicyId;
    private Double rateMultiplier;
    private Integer workMinutesPerMonth;
    private String description;

    private String updatedBy;
    private LocalDateTime updatedAt;
}
