package boot.team.hr.eun.attendance.service;

import boot.team.hr.eun.attendance.dto.AdminAttendanceUpdateRequestDto;
import boot.team.hr.eun.attendance.dto.AttendanceResponseDto;

public interface AdminAttendanceService {
    AttendanceResponseDto updateCheckOut(AdminAttendanceUpdateRequestDto req);
}
