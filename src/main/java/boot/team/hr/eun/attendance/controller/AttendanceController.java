package boot.team.hr.eun.attendance.controller;

import boot.team.hr.eun.attendance.dto.AttendanceRequestDto;
import boot.team.hr.eun.attendance.dto.AttendanceResponseDto;
import boot.team.hr.eun.attendance.service.AttendanceService;
import boot.team.hr.min.account.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/work")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/check-in")
    public AttendanceResponseDto checkIn(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody AttendanceRequestDto request
    ) {
        Long employeeId = 1L; // 나중에 Security에서 꺼내기
        return attendanceService.checkIn(employeeId, request);
    }
}
