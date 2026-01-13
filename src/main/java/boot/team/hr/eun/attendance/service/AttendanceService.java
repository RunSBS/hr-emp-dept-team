package boot.team.hr.eun.attendance.service;

import boot.team.hr.eun.attendance.dto.AttendanceRequestDto;
import boot.team.hr.eun.attendance.dto.AttendanceResponseDto;

public interface AttendanceService {

    AttendanceResponseDto checkIn(
            Long employeeId,
            AttendanceRequestDto request
    );

    // AttendanceResponseDto checkOut(Long employeeId);

}
