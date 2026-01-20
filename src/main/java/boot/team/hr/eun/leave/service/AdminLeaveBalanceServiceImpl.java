package boot.team.hr.eun.leave.service;

import boot.team.hr.eun.leave.dto.LeaveBalanceResponseDto;
import boot.team.hr.eun.leave.dto.LeaveBalanceUpdateDto;
import boot.team.hr.eun.leave.entity.LeaveBalance;
import boot.team.hr.eun.leave.repo.LeaveBalanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminLeaveBalanceServiceImpl implements AdminLeaveBalanceService {

    private final LeaveBalanceRepository leaveBalanceRepository;

    /* ===============================
       전체 연차 조회
    =============================== */
    @Override
    @Transactional(readOnly = true)
    public List<LeaveBalanceResponseDto> getAllLeaveBalances() {
        return leaveBalanceRepository.findAll().stream()
                .map(LeaveBalanceResponseDto::from)
                .toList();
    }

    /* ===============================
       연도별 연차 조회
    =============================== */
    @Override
    @Transactional(readOnly = true)
    public List<LeaveBalanceResponseDto> getLeaveBalancesByYear(int year) {
        return leaveBalanceRepository.findByLeaveYear(year).stream()
                .map(LeaveBalanceResponseDto::from)
                .toList();
    }

    /* ===============================
       연차 최초 부여
    =============================== */
    @Override
    public void createLeaveBalance(String employeeId, int year, int totalMinutes) {

        leaveBalanceRepository
                .findByEmployeeIdAndLeaveYear(employeeId, year)
                .ifPresent(b -> {
                    throw new IllegalStateException("해당 연도의 연차가 이미 존재합니다.");
                });

        LeaveBalance balance = LeaveBalance.create(employeeId, year, totalMinutes);
        leaveBalanceRepository.save(balance);
    }

    /* ===============================
       연차 수정
    =============================== */
    @Override
    public void updateLeaveBalance(Long balanceId, LeaveBalanceUpdateDto dto) {
        LeaveBalance balance = leaveBalanceRepository.findById(balanceId)
                .orElseThrow(() -> new IllegalStateException("연차 정보가 없습니다."));

        balance.updateTotalLeave(dto.getTotalLeaveMinutes());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Integer> getLeaveYears() {
        return leaveBalanceRepository.findDistinctLeaveYears();
    }
}
