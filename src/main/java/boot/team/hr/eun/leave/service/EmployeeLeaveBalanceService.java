package boot.team.hr.eun.leave.service;

import boot.team.hr.eun.leave.dto.LeaveBalanceResponseDto;

import java.util.List;

public interface EmployeeLeaveBalanceService {

    // 내 연차 전체 조회
    List<LeaveBalanceResponseDto> getMyLeaveBalances(String employeeId);
}
