package boot.team.hr.eun.attendance.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class AttendancePolicyResponseDto {

    private Long policyId;
    private Integer startTime;
    private Integer lateTime;
    private Integer overtimeStart;

    private Integer breakStart;
    private Integer breakEnd;

    private String description;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
}
