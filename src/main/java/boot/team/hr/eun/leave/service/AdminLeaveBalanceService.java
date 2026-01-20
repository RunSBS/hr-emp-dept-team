package boot.team.hr.eun.leave.service;

import boot.team.hr.eun.leave.dto.LeaveBalanceResponseDto;
import boot.team.hr.eun.leave.dto.LeaveBalanceUpdateDto;

import java.util.List;

public interface AdminLeaveBalanceService {

    // 전체 조회
    List<LeaveBalanceResponseDto> getAllLeaveBalances();

    // 연도별 조회
    List<LeaveBalanceResponseDto> getLeaveBalancesByYear(int year);

    // 연차 최초 부여
    void createLeaveBalance(String employeeId, int year, int totalMinutes);

    // 연차 수정
    void updateLeaveBalance(Long balanceId, LeaveBalanceUpdateDto dto);

    List<Integer> getLeaveYears();
}
