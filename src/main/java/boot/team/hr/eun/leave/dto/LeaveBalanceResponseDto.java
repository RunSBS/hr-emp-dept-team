package boot.team.hr.eun.leave.dto;

import boot.team.hr.eun.leave.entity.LeaveBalance;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LeaveBalanceResponseDto {

    private Long balanceId;
    private String employeeId;
    private Integer leaveYear;

    private Integer totalLeaveMinutes;
    private Integer usedLeaveMinutes;
    private Integer remainingLeaveMinutes;

    /* ===============================
       Entity → DTO 변환 메서드
    =============================== */
    public static LeaveBalanceResponseDto from(LeaveBalance entity) {
        return new LeaveBalanceResponseDto(
                entity.getBalanceId(),
                entity.getEmployeeId(),
                entity.getLeaveYear(),
                entity.getTotalLeaveMinutes(),
                entity.getUsedLeaveMinutes(),
                entity.getRemainingLeaveMinutes()
        );
    }
}
