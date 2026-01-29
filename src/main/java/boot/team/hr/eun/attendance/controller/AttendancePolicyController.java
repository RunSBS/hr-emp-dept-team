package boot.team.hr.eun.attendance.controller;

import boot.team.hr.eun.attendance.dto.AttendancePolicyResponseDto;
import boot.team.hr.eun.attendance.service.AttendancePolicyService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/work-policy")
public class AttendancePolicyController {

    private final AttendancePolicyService attendancePolicyService;

    @GetMapping("/current")
    public AttendancePolicyResponseDto getCurrentPolicy() {
        return attendancePolicyService.getCurrentPolicy();
    }
}
