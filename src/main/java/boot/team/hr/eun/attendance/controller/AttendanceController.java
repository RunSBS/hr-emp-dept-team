package boot.team.hr.eun.attendance.controller;

import boot.team.hr.eun.attendance.dto.AttendanceListResponseDto;
import boot.team.hr.eun.attendance.dto.AttendanceRequestDto;
import boot.team.hr.eun.attendance.dto.AttendanceResponseDto;
import boot.team.hr.eun.attendance.dto.WorkStatusResponseDto;
import boot.team.hr.eun.attendance.service.AttendanceQueryService;
import boot.team.hr.eun.attendance.service.AttendanceService;
import boot.team.hr.min.account.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/work")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final AttendanceQueryService attendanceQueryService;

    @PostMapping("/check-in")
    public AttendanceResponseDto checkIn(

            @RequestBody AttendanceRequestDto request
    ) {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
        return attendanceService.checkIn(email, request);
    }

    @PostMapping("/check-out")
    public AttendanceResponseDto checkOut(
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        String email = user.getUsername();
        return attendanceService.checkOut(email);
    }

    @GetMapping("/status")
    public WorkStatusResponseDto getTodayStatus(
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return attendanceService.getTodayStatus(user.getUsername());
    }

    /**
     * 사원 본인 근태 조회
     */
    @GetMapping("/my")
    public List<AttendanceListResponseDto> myAttendance(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        LocalDate start = (startDate != null && !startDate.isBlank())
                ? LocalDate.parse(startDate)
                : LocalDate.now().minusDays(30);

        LocalDate end = (endDate != null && !endDate.isBlank())
                ? LocalDate.parse(endDate)
                : LocalDate.now();

        return attendanceQueryService.getMyAttendance(
                user.getUsername(),
                start,
                end
        );
    }
}
