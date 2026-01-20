package boot.team.hr.eun.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class WorkStatusResponseDto {
    private boolean checkedIn;
    private boolean checkedOut;
}
