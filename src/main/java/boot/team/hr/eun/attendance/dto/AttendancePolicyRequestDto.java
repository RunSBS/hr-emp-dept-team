package boot.team.hr.eun.attendance.dto;

import lombok.Getter;

import java.time.LocalDate;

@Getter
public class AttendancePolicyRequestDto {

    private Integer startTime;
    private Integer lateTime;
    private Integer overtimeStart;
    private String description;

    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
}
