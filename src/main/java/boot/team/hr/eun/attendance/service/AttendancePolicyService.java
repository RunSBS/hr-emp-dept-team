package boot.team.hr.eun.attendance.service;

import boot.team.hr.eun.attendance.dto.AttendancePolicyRequestDto;
import boot.team.hr.eun.attendance.dto.AttendancePolicyResponseDto;

import java.util.List;

public interface AttendancePolicyService {

    AttendancePolicyResponseDto getCurrentPolicy();

    List<AttendancePolicyResponseDto> getAllPolicies();

    AttendancePolicyResponseDto createPolicy(
            AttendancePolicyRequestDto request,
            Long adminId
    );

    AttendancePolicyResponseDto updatePolicy(
            Long policyId,
            AttendancePolicyRequestDto request,
            Long adminId
    );
}
