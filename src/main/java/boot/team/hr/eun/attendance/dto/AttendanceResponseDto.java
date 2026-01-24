package boot.team.hr.eun.attendance.dto;

import boot.team.hr.eun.attendance.enums.WorkStatus;
import boot.team.hr.eun.attendance.enums.WorkType;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AttendanceResponseDto {

    private WorkStatus workStatus;
    private WorkType workType;

}
