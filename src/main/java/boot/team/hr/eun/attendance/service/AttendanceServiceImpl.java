package boot.team.hr.eun.attendance.service;

import boot.team.hr.eun.attendance.dto.AttendanceRequestDto;
import boot.team.hr.eun.attendance.dto.AttendanceResponseDto;
import boot.team.hr.eun.attendance.dto.WorkStatusResponseDto;
import boot.team.hr.eun.attendance.entity.AttendancePolicy;
import boot.team.hr.eun.attendance.entity.WorkRecord;
import boot.team.hr.eun.attendance.enums.WorkStatus;
import boot.team.hr.eun.attendance.enums.WorkType;
import boot.team.hr.eun.attendance.repo.AttendancePolicyRepository;
import boot.team.hr.eun.attendance.repo.WorkRecordRepository;
import boot.team.hr.eun.attendance.util.AttendanceTimeCalculator;
import boot.team.hr.eun.attendance.util.WorkDateResolver;
import boot.team.hr.eun.attendance.vaildator.AttendanceLocationValidator;
import boot.team.hr.hyun.emp.entity.Emp;
import boot.team.hr.hyun.emp.repo.EmpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class AttendanceServiceImpl implements AttendanceService {

    private final WorkRecordRepository workRecordRepository;
    private final AttendancePolicyRepository policyRepository;
    private final AttendanceLocationValidator locationValidator;
    private final EmpRepository empRepository;

    /* ===================== 출근 ===================== */
    @Override
    public AttendanceResponseDto checkIn(String email, AttendanceRequestDto request) {

        Emp emp = empRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("EMP 정보가 존재하지 않습니다."));

        String empId = emp.getEmpId();
        LocalDate workDate = WorkDateResolver.today();

        // 위치 검증
        locationValidator.validate(
                request.getLatitude(),
                request.getLongitude()
        );

        // 🔥 반드시 기존 레코드를 가져온다
        WorkRecord record = workRecordRepository
                .findByEmployeeIdAndWorkDate(empId, workDate)
                .orElseThrow(() ->
                        new IllegalStateException("오늘의 근무 레코드가 생성되지 않았습니다.")
                );

        if (record.getWorkStatus() == WorkStatus.ABSENT) {
            throw new IllegalStateException("결근 처리된 날짜에는 출근할 수 없습니다.");
        }

        if (record.getWorkStatus() != WorkStatus.PENDING) {
            throw new IllegalStateException("출근 가능한 상태가 아닙니다.");
        }

        if (record.getCheckIn() != null) {
            throw new IllegalStateException("이미 출근 처리되었습니다.");
        }

        AttendancePolicy policy = policyRepository
                .findPolicyByWorkDate(workDate)
                .orElseThrow(() ->
                        new IllegalStateException("적용 가능한 근태 정책이 없습니다.")
                );

        LocalDateTime checkInTime = LocalDateTime.now();

        WorkStatus workStatus =
                WorkStatus.decideAtCheckIn(
                        checkInTime,
                        policy.getLateLocalTime()
                );

        record.setCheckIn(checkInTime);
        record.setWorkStatus(workStatus);
        record.setWorkType(WorkType.decideAtCheckIn());

        return AttendanceResponseDto.builder()
                .workStatus(record.getWorkStatus())
                .workType(record.getWorkType())
                .build();
    }


    /* ===================== 퇴근 ===================== */
    @Override
    public AttendanceResponseDto checkOut(String email) {

        Emp emp = empRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalStateException("EMP 정보가 존재하지 않습니다.")
                );

        String empId = emp.getEmpId();
        LocalDate workDate = WorkDateResolver.today();

        WorkRecord record = workRecordRepository
                .findByEmployeeIdAndWorkDate(empId, workDate)
                .orElseThrow(() ->
                        new IllegalStateException("출근 기록이 존재하지 않습니다.")
                );

        if (!record.getWorkType().canCheckOut()) {
            throw new IllegalStateException("퇴근할 수 없는 근무 상태입니다.");
        }

        if (record.getCheckOut() != null) {
            throw new IllegalStateException("이미 퇴근 처리되었습니다.");
        }

        LocalDateTime checkOutTime = LocalDateTime.now();
        record.setCheckOut(checkOutTime);

        AttendancePolicy policy = policyRepository
                .findPolicyByWorkDate(workDate)
                .orElseThrow(() ->
                        new IllegalStateException("적용 가능한 근태 정책이 없습니다.")
                );

        AttendanceTimeCalculator.WorkTimeResult timeResult =
                AttendanceTimeCalculator.calculate(
                        record.getCheckIn(),
                        checkOutTime,
                        LocalDateTime.of(
                                workDate,
                                policy.getOvertimeStartLocalTime()
                        )
                );

        WorkStatus finalStatus =
                WorkStatus.decideAtCheckOut(
                        record.getWorkStatus(),
                        checkOutTime,
                        policy.getStartLocalTime()
                );

        record.setWorkStatus(finalStatus);
        record.setNormalWorkMinutes(timeResult.normalMinutes());
        record.setOvertimeWorkMinutes(timeResult.overtimeMinutes());
        record.setTotalWorkMinutes(timeResult.totalMinutes());
        record.setWorkType(
                WorkType.decideAtCheckOut(record.getWorkType())
        );

        return AttendanceResponseDto.builder()
                .workStatus(record.getWorkStatus())
                .workType(record.getWorkType())
                .build();
    }

    /* ===================== 오늘 상태 조회 ===================== */
    @Override
    @Transactional(readOnly = true)
    public WorkStatusResponseDto getTodayStatus(String email) {

        Emp emp = empRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalStateException("EMP 정보가 존재하지 않습니다.")
                );

        LocalDate workDate = WorkDateResolver.today();

        return workRecordRepository
                .findByEmployeeIdAndWorkDate(emp.getEmpId(), workDate)
                .map(record ->
                        new WorkStatusResponseDto(
                                record.getCheckIn() != null,
                                record.getCheckOut() != null,
                                record.getWorkStatus(),
                                record.getWorkType()
                        )
                )
                .orElseGet(() ->
                        new WorkStatusResponseDto(
                                false,
                                false,
                                null,
                                null
                        )
                );
    }
}
