package boot.team.hr.eun.attendance.service;

import boot.team.hr.eun.attendance.dto.AttendanceRequestDto;
import boot.team.hr.eun.attendance.dto.AttendanceResponseDto;
import boot.team.hr.eun.attendance.dto.WorkStatusResponseDto;

public interface AttendanceService {

    AttendanceResponseDto checkIn(
            String email,
            AttendanceRequestDto request
    );

    AttendanceResponseDto checkOut(String email);

    WorkStatusResponseDto getTodayStatus(String email);


}
