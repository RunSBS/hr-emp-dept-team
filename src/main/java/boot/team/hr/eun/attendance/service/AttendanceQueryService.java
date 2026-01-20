package boot.team.hr.eun.attendance.service;

import boot.team.hr.eun.attendance.dto.AttendanceListResponseDto;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceQueryService {

    // 사원 본인 근태 조회
    List<AttendanceListResponseDto> getMyAttendance(
            String email,
            LocalDate startDate,
            LocalDate endDate
    );

    // 관리자 전체 근태 조회
    List<AttendanceListResponseDto> getAllAttendance(
            String empId,
            LocalDate startDate,
            LocalDate endDate
    );
}
