package boot.team.hr.eun.attendance.dto;

import boot.team.hr.eun.attendance.enums.WorkStatus;
import boot.team.hr.eun.attendance.enums.WorkType;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class WorkStatusResponseDto {

    private boolean checkedIn;
    private boolean checkedOut;

    private WorkStatus workStatus; // NORMAL, LATE, ...
    private WorkType workType;     // OFFICE, LEAVE, ...
}
