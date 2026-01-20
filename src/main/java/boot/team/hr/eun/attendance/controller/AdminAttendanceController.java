package boot.team.hr.eun.attendance.controller;

import boot.team.hr.eun.attendance.dto.AttendanceListResponseDto;
import boot.team.hr.eun.attendance.service.AttendanceQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/admin/attendance")
@RequiredArgsConstructor
public class AdminAttendanceController {

    private final AttendanceQueryService queryService;

    @GetMapping("/list")
    public List<AttendanceListResponseDto> list(
            @RequestParam(required = false) String empId,
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        LocalDate start = (startDate == null || startDate.isBlank())
                ? null
                : LocalDate.parse(startDate);

        LocalDate end = (endDate == null || endDate.isBlank())
                ? null
                : LocalDate.parse(endDate);

        return queryService.getAllAttendance(empId, start, end);
    }
}
