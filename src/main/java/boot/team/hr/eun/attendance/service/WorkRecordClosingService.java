package boot.team.hr.eun.attendance.service;

import boot.team.hr.eun.attendance.entity.AttendancePolicy;
import boot.team.hr.eun.attendance.entity.WorkRecord;
import boot.team.hr.eun.attendance.enums.WorkStatus;
import boot.team.hr.eun.attendance.enums.WorkType;
import boot.team.hr.eun.attendance.repo.AttendancePolicyRepository;
import boot.team.hr.eun.attendance.repo.WorkRecordRepository;
import boot.team.hr.eun.attendance.util.AttendanceTimeCalculator;
import boot.team.hr.eun.leave.repo.LeaveRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkRecordClosingService {

    private final WorkRecordRepository workRecordRepository;
    private final AttendancePolicyRepository policyRepository;
    private final LeaveRequestRepository leaveRequestRepository;

    public void closeWorkDate(LocalDate workDate) {

        if (isWeekend(workDate)) return;

        AttendancePolicy policy = policyRepository.findPolicyByWorkDate(workDate)
                .orElseThrow(() -> new IllegalStateException("적용 가능한 근태 정책이 없습니다."));

        // overtimeStart 이전이면 마감 안 함
        if (LocalTime.now().isBefore(policy.getOvertimeStartLocalTime())) {
            return;
        }

        List<WorkRecord> pendingRecords =
                workRecordRepository.findAllByWorkDateAndWorkStatus(workDate, WorkStatus.PENDING);

        for (WorkRecord record : pendingRecords) {

            // 이미 출근한 사람은 제외
            if (record.getCheckIn() != null) continue;

            String empId = record.getEmployeeId(); // ✅ getEmp() 같은 거 없음

            record.setWorkStatus(WorkStatus.ABSENT);
            record.setWorkType(WorkType.OFF);

            boolean hasAmHalfLeave = leaveRequestRepository.existsApprovedAmLeave(empId, workDate);
            boolean hasPmHalfLeave = leaveRequestRepository.existsApprovedPmLeave(empId, workDate);

            var time = (hasAmHalfLeave || hasPmHalfLeave)
                    ? AttendanceTimeCalculator.calculateHalfDayAbsent(policy)
                    : AttendanceTimeCalculator.calculateAbsent(policy);

            record.setUnpaidMinutes(time.unpaidMinutes());
            record.setNormalWorkMinutes(0);
            record.setOvertimeWorkMinutes(0);
            record.setTotalWorkMinutes(0);
        }
    }

    private boolean isWeekend(LocalDate date) {
        return date.getDayOfWeek().getValue() >= 6;
    }
}
