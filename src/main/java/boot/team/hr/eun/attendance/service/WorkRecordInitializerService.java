package boot.team.hr.eun.attendance.service;

import boot.team.hr.eun.attendance.entity.WorkRecord;
import boot.team.hr.eun.attendance.enums.WorkStatus;
import boot.team.hr.eun.attendance.enums.WorkType;
import boot.team.hr.eun.attendance.repo.WorkRecordRepository;
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

            // 1️⃣ 휴가 승인자
            if (leaveRequestRepository
                    .existsApprovedLeave(empId, workDate)) {

                createNormalRecord(empId, workDate, WorkType.LEAVE);
                continue;
            }

            // 2️⃣ 외근자
            if (outsourcingRepository
                    .existsAssignment(empId, workDate)) {

                createNormalRecord(empId, workDate, WorkType.OUTSIDE);
                continue;
            }

            // 3️⃣ 일반 근무자 → PENDING
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
        workRecordRepository.save(
                WorkRecord.builder()
                        .employeeId(empId)
                        .workDate(workDate)
                        .workStatus(WorkStatus.NORMAL)
                        .workType(type)
                        .normalWorkMinutes(540)
                        .overtimeWorkMinutes(0)
                        .unpaidMinutes(0)
                        .totalWorkMinutes(540)
                        .build()
        );
    }

    private boolean isWeekend(LocalDate date) {
        return date.getDayOfWeek().getValue() >= 6;
    }
}


