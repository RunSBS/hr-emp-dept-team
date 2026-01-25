package boot.team.hr.eun.attendance.service;

import boot.team.hr.eun.attendance.entity.WorkRecord;
import boot.team.hr.eun.attendance.enums.WorkStatus;
import boot.team.hr.eun.attendance.enums.WorkType;
import boot.team.hr.eun.attendance.repo.AttendancePolicyRepository;
import boot.team.hr.eun.attendance.repo.WorkRecordRepository;
import boot.team.hr.eun.attendance.util.AttendanceTimeCalculator;
import boot.team.hr.eun.leave.repo.LeaveRequestRepository;
import boot.team.hr.hyun.emp.entity.Emp;
import boot.team.hr.hyun.emp.repo.EmpRepository;
import boot.team.hr.hyun.outsourcing.repo.OutsourcingAssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkRecordInitializerService {

    private final EmpRepository empRepository;
    private final WorkRecordRepository workRecordRepository;
    private final AttendancePolicyRepository policyRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final OutsourcingAssignmentRepository outsourcingRepository;

    public void createDailyPendingRecords(LocalDate workDate) {

        if (isWeekend(workDate)) return;

        List<Emp> employees = empRepository.findAllEmployeesOnly();

        for (Emp emp : employees) {

            String empId = emp.getEmpId();

            if (workRecordRepository
                    .existsByEmployeeIdAndWorkDate(empId, workDate)) {
                continue;
            }

            // 1) 휴가 승인자
            if (leaveRequestRepository.existsApprovedPaidLeave(empId, workDate)) {
                // ✅ 유급휴가: 정상근무와 동일하게 인정(무급 0)
                createNormalRecord(empId, workDate, WorkType.LEAVE);
                continue;
            }

            if (leaveRequestRepository.existsApprovedUnpaidLeave(empId, workDate)) {
                // ✅ 무급휴가: 정상근무시간만큼 무급 처리
                createUnpaidLeaveRecord(empId, workDate);
                continue;
            }

            // 2) 외근자
            if (outsourcingRepository
                    .existsAssignment(emp, workDate)) {

                createNormalRecord(empId, workDate, WorkType.OUTSIDE);
                continue;
            }

            // 3) 일반 근무자 → PENDING
            WorkRecord record = WorkRecord.builder()
                    .employeeId(empId)
                    .workDate(workDate)
                    .workStatus(WorkStatus.PENDING)
                    .workType(WorkType.OFF)
                    .normalWorkMinutes(0)
                    .overtimeWorkMinutes(0)
                    .unpaidMinutes(0)
                    .totalWorkMinutes(0)
                    .build();

            workRecordRepository.save(record);
        }
    }

    private void createNormalRecord(
            String empId,
            LocalDate workDate,
            WorkType type
    ) {
        var policy = policyRepository
                .findPolicyByWorkDate(workDate)
                .orElseThrow(() -> new IllegalStateException("적용 가능한 근태 정책이 없습니다."));

        var time = AttendanceTimeCalculator.calculateAsNormalFullDay(policy);

        workRecordRepository.save(
                WorkRecord.builder()
                        .employeeId(empId)
                        .workDate(workDate)
                        .workStatus(WorkStatus.NORMAL)
                        .workType(type)
                        .normalWorkMinutes(time.normalMinutes())
                        .overtimeWorkMinutes(time.overtimeMinutes())
                        .unpaidMinutes(time.unpaidMinutes())
                        .totalWorkMinutes(time.totalMinutes())
                        .build()
        );
    }

    private void createUnpaidLeaveRecord(String empId, LocalDate workDate) {

        var policy = policyRepository
                .findPolicyByWorkDate(workDate)
                .orElseThrow(() -> new IllegalStateException("적용 가능한 근태 정책이 없습니다."));

        var time = AttendanceTimeCalculator.calculateAbsent(policy);
        // 결근과 동일하게 '정상근무 기준 분 전부 무급' 처리

        workRecordRepository.save(
                WorkRecord.builder()
                        .employeeId(empId)
                        .workDate(workDate)
                        // 상태는 프로젝트 정책에 따라 NORMAL/ABSENT/별도(UNPAID_LEAVE)가 될 수 있는데,
                        // 너희 enum에 무급휴가 상태가 없으니 "정상 + LEAVE 타입 + 무급 분"으로 기록하는 게 무난함
                        .workStatus(WorkStatus.NORMAL)
                        .workType(WorkType.LEAVE)
                        .normalWorkMinutes(0)
                        .overtimeWorkMinutes(0)
                        .unpaidMinutes(time.unpaidMinutes())
                        .totalWorkMinutes(0)
                        .build()
        );
    }


    private boolean isWeekend(LocalDate date) {
        return date.getDayOfWeek().getValue() >= 6;
    }
}
