package boot.team.hr.eun.attendance.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class AttendancePolicyRequestDto {

    private Integer startTime;
    private Integer lateTime;
    private Integer overtimeStart;

    private Integer breakStart;
    private Integer breakEnd;

    private String description;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
}
