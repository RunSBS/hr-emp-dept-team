package boot.team.hr.eun.attendance.dto;

import lombok.Getter;

/*프론트 -> 백엔드 (위치 정보 전달)*/
@Getter
public class AttendanceRequestDto {
    private double latitude;
    private double longitude;
}
