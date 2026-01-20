package boot.team.hr.eun.attendance.controller;

import boot.team.hr.eun.attendance.dto.AttendancePolicyRequestDto;
import boot.team.hr.eun.attendance.dto.AttendancePolicyResponseDto;
import boot.team.hr.eun.attendance.service.AttendancePolicyService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/attendance-policy")
@RequiredArgsConstructor
public class AttendancePolicyAdminController {

    private final AttendancePolicyService policyService;

    @GetMapping("/current")
    public AttendancePolicyResponseDto getCurrentPolicy() {
        return policyService.getCurrentPolicy();
    }

    @GetMapping
    public List<AttendancePolicyResponseDto> getAllPolicies() {
        return policyService.getAllPolicies();
    }

    @PostMapping
    public AttendancePolicyResponseDto createPolicy(
            @RequestBody AttendancePolicyRequestDto request
    ) {
        Long adminId = 1L; // 🔥 나중에 Security 연동
        return policyService.createPolicy(request, adminId);
    }

    @PutMapping("/{policyId}")
    public AttendancePolicyResponseDto updatePolicy(
            @PathVariable Long policyId,
            @RequestBody AttendancePolicyRequestDto request
    ) {
        Long adminId = 1L; // 🔥 나중에 Security 연동
        return policyService.updatePolicy(policyId, request, adminId);
    }
}
