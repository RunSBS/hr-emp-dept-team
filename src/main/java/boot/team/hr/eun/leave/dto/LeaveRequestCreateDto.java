package boot.team.hr.eun.leave.dto;

import lombok.Getter;

import java.time.LocalDate;

@Getter
public class LeaveRequestCreateDto {

    private Long leaveTypeId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String leaveReason;
}
