package boot.team.hr.eun.leave.service;

import boot.team.hr.eun.leave.dto.LeaveBalanceResponseDto;
import boot.team.hr.eun.leave.entity.LeaveBalance;
import boot.team.hr.eun.leave.repo.LeaveBalanceRepository;
import boot.team.hr.hyun.emp.entity.Emp;
import boot.team.hr.hyun.emp.repo.EmpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EmployeeLeaveBalanceServiceImpl implements EmployeeLeaveBalanceService {

    private final LeaveBalanceRepository leaveBalanceRepository;
    private final EmpRepository empRepository; // emp 테이블용

    @Override
    public List<LeaveBalanceResponseDto> getMyLeaveBalances(String email) {

        // 1️⃣ email → emp_id 매핑
        Emp emp = empRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("직원 정보를 찾을 수 없습니다."));

        String empId = emp.getEmpId();

        // 2️⃣ leave_balance 조회 (Optional → List)
        List<LeaveBalance> balances = leaveBalanceRepository.findByEmployeeId(empId);

        // 3️⃣ DTO 변환
        return balances.stream()
                .map(LeaveBalanceResponseDto::from)
                .toList();
    }
}
