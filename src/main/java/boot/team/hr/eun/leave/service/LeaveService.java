package boot.team.hr.eun.leave.service;

import boot.team.hr.eun.leave.dto.LeaveRequestCreateDto;
import boot.team.hr.eun.leave.dto.LeaveRequestResponseDto;
import boot.team.hr.eun.leave.dto.LeaveTypeResponseDto;

import java.util.List;

public interface LeaveService {

    // 휴가 유형 조회 (사원용)
    List<LeaveTypeResponseDto> getLeaveTypes();

    // 휴가 신청
    void requestLeave(String email, LeaveRequestCreateDto dto);

    // 내 휴가 신청 내역 조회
    List<LeaveRequestResponseDto> getMyLeaveRequests(String email);
}


