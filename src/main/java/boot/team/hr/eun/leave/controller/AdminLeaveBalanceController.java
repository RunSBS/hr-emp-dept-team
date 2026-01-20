package boot.team.hr.eun.leave.controller;

import boot.team.hr.eun.leave.dto.LeaveBalanceResponseDto;
import boot.team.hr.eun.leave.dto.LeaveBalanceUpdateDto;
import boot.team.hr.eun.leave.service.AdminLeaveBalanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/leave-balance")
@RequiredArgsConstructor
public class AdminLeaveBalanceController {

    private final AdminLeaveBalanceService adminLeaveBalanceService;

    /* ===============================
       연차 현황 조회 (전체 / 연도별)
       GET /admin/leave-balance
       GET /admin/leave-balance?year=2025
    =============================== */
    @GetMapping
    public List<LeaveBalanceResponseDto> getLeaveBalances(
            @RequestParam(required = false) Integer year
    ) {
        if (year == null) {
            return adminLeaveBalanceService.getAllLeaveBalances();
        }
        return adminLeaveBalanceService.getLeaveBalancesByYear(year);
    }

    /* ===============================
        연도 목록 조회
        GET /admin/leave-balance/years
    =============================== */
    @GetMapping("/years")
    public List<Integer> getLeaveYears() {
        return adminLeaveBalanceService.getLeaveYears();
    }


    /* ===============================
       연차 최초 부여
       POST /admin/leave-balance
    =============================== */
    @PostMapping
    public void createLeaveBalance(
            @RequestParam String employeeId,
            @RequestParam Integer totalMinutes,
            @RequestParam Integer year
    ) {
        adminLeaveBalanceService.createLeaveBalance(employeeId, year, totalMinutes);
    }

    /* ===============================
       연차 수정
       PUT /admin/leave-balance/{balanceId}
    =============================== */
    @PutMapping("/{balanceId}")
    public void updateLeaveBalance(
            @PathVariable Long balanceId,
            @RequestBody LeaveBalanceUpdateDto dto
    ) {
        adminLeaveBalanceService.updateLeaveBalance(balanceId, dto);
    }
}
