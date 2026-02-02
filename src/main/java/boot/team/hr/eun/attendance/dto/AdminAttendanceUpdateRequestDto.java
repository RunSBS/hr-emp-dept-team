package boot.team.hr.eun.attendance.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminAttendanceUpdateRequestDto {

    private String empId;        // 수정 대상 사원
    private String workDate;     // yyyy-MM-dd
    private String checkOut;     // ISO(LocalDateTime) 예: 2026-01-21T06:00:00
}
