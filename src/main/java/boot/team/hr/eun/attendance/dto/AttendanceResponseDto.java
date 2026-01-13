package boot.team.hr.eun.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/*결과 응답용*/
@Getter
@Builder
@AllArgsConstructor
public class AttendanceResponseDto {
    private boolean success;
    private String message;
    private String workStatus;
    private String workType;
}
