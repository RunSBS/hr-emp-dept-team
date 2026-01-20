package boot.team.hr.eun.attendance.service;

import boot.team.hr.eun.attendance.dto.AttendanceRequestDto;
import boot.team.hr.eun.attendance.dto.AttendanceResponseDto;
import boot.team.hr.eun.attendance.dto.WorkStatusResponseDto;
import boot.team.hr.eun.attendance.entity.*;
import boot.team.hr.eun.attendance.repo.*;
import boot.team.hr.hyun.emp.entity.Emp;
import boot.team.hr.hyun.emp.repo.EmpRepository;
import boot.team.hr.eun.attendance.util.AttendanceTimeCalculator;
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
    private final CompanyLocationRepository locationRepository;
    private final EmpRepository empRepository;

    /* ===================== 출근 ===================== */
    @Override
    public AttendanceResponseDto checkIn(String email, AttendanceRequestDto request) {
        try {
            // 1. email -> EMP 조회
            Emp emp = empRepository.findByEmail(email)
                    .orElseThrow(() ->
                            new IllegalStateException("EMP 정보가 존재하지 않습니다.")
                    );

            String empId = emp.getEmpId();

            // 2. 위치 체크
            CompanyLocation company = locationRepository.findById(1L)
                    .orElseThrow(() -> new IllegalStateException("회사 위치 정보 없음"));

            double distance = calculateDistance(
                    company.getLatitude(),
                    company.getLongitude(),
                    request.getLatitude(),
                    request.getLongitude()
            );

            if (distance > company.getAllowedRadiusM()) {
                throw new IllegalStateException("회사 위치 범위 밖입니다.");
            }

            // 3. 오늘 출근 여부 확인
            workRecordRepository
                    .findByEmployeeIdAndWorkDate(empId, LocalDate.now())
                    .ifPresent(r -> {
                        throw new IllegalStateException("이미 출근 처리되었습니다.");
                    });

            // 4. 근태 정책 조회
            AttendancePolicy policy = policyRepository.findCurrentPolicy()
                    .orElseThrow(() -> new IllegalStateException("근태 정책이 존재하지 않습니다."));

            LocalDateTime checkInTime = LocalDateTime.now();

            // ✅ 정책 기반 지각 판단
            boolean isLate = AttendanceTimeCalculator.isLate(policy, checkInTime);
            String workStatus = isLate ? "LATE" : "NORMAL";

            // 5. 기록 저장
            WorkRecord record = WorkRecord.builder()
                    .employeeId(empId)
                    .workDate(LocalDate.now())
                    .checkIn(checkInTime)
                    .checkOut(null)
                    .workStatus(workStatus)
                    .workType("OFFICE")
                    .normalWorkMinutes(0)
                    .overtimeWorkMinutes(0)
                    .unpaidMinutes(0)
                    .totalWorkMinutes(0)
                    .build();

            workRecordRepository.save(record);

            return AttendanceResponseDto.builder()
                    .success(true)
                    .workStatus(workStatus)
                    .workType("OFFICE")
                    .message("출근 처리 완료")
                    .build();

        } catch (Exception e) {
            return AttendanceResponseDto.builder()
                    .success(false)
                    .message("출근 처리 중 오류가 발생했습니다: " + e.getMessage())
                    .build();
        }
    }

    /* ===================== 퇴근 ===================== */
    @Override
    public AttendanceResponseDto checkOut(String email) {
        try {
            Emp emp = empRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalStateException("EMP 정보가 존재하지 않습니다."));
            String empId = emp.getEmpId();

            WorkRecord record = workRecordRepository
                    .findByEmployeeIdAndWorkDate(empId, LocalDate.now())
                    .orElseThrow(() -> new IllegalStateException("출근 기록이 존재하지 않습니다."));

            if ("LEAVE".equals(record.getWorkType())) {
                throw new IllegalStateException("휴가일에는 퇴근 처리할 수 없습니다.");
            }

            if (record.getCheckOut() != null) {
                throw new IllegalStateException("이미 퇴근 처리되었습니다.");
            }

            record.setCheckOut(LocalDateTime.now());

            AttendancePolicy policy = policyRepository.findCurrentPolicy()
                    .orElseThrow(() -> new IllegalStateException("근태 정책이 존재하지 않습니다."));
            calculateWorkMinutes(record, policy);

            record.setWorkType("OFF");
            workRecordRepository.save(record);

            return AttendanceResponseDto.builder()
                    .success(true)
                    .workStatus(record.getWorkStatus())
                    .workType(record.getWorkType())
                    .message("퇴근 처리 완료")
                    .build();

        } catch (Exception e) {
            return AttendanceResponseDto.builder()
                    .success(false)
                    .message("퇴근 처리 중 오류가 발생했습니다: " + e.getMessage())
                    .build();
        }
    }

    /* ===================== 오늘 상태 조회 ===================== */
    @Override
    @Transactional(readOnly = true)
    public WorkStatusResponseDto getTodayStatus(String email) {

        // 1. email → EMP 조회
        Emp emp = empRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalStateException("EMP 정보가 존재하지 않습니다.")
                );

        String empId = emp.getEmpId();

        // 2. 오늘 근무 기록 조회
        return workRecordRepository
                .findByEmployeeIdAndWorkDate(empId, LocalDate.now())
                .map(record -> {
                    if ("LEAVE".equals(record.getWorkType())) {
                        return new WorkStatusResponseDto(false, false);
                    }
                    return new WorkStatusResponseDto(
                            record.getCheckIn() != null,
                            record.getCheckOut() != null
                    );
                })

                .orElseGet(() ->
                        new WorkStatusResponseDto(false, false)
                );
    }

    /* ===================== 거리 계산 ===================== */
    private double calculateDistance(
            double lat1, double lon1,
            double lat2, double lon2
    ) {
        final int R = 6371000;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos(Math.toRadians(lat1)) *
                                Math.cos(Math.toRadians(lat2)) *
                                Math.sin(dLon / 2) * Math.sin(dLon / 2);

        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    private void calculateWorkMinutes(WorkRecord record, AttendancePolicy policy) {

        LocalDateTime checkIn = record.getCheckIn();
        LocalDateTime checkOut = record.getCheckOut();

        if (checkIn == null || checkOut == null) return;

        // 출근/퇴근 시간 HHmm → LocalDateTime 변환
        int startHour = policy.getStartTime() / 100;
        int startMin  = policy.getStartTime() % 100;
        int lateHour  = policy.getLateTime() / 100;
        int lateMin   = policy.getLateTime() % 100;
        int overtimeHour = policy.getOvertimeStart() / 100;
        int overtimeMin  = policy.getOvertimeStart() % 100;

        LocalDateTime startTime = checkIn.toLocalDate().atTime(startHour, startMin);
        LocalDateTime lateTime  = checkIn.toLocalDate().atTime(lateHour, lateMin);
        LocalDateTime overtimeTime = checkIn.toLocalDate().atTime(overtimeHour, overtimeMin);

        // 1️⃣ 지각 여부 판단
        if (checkIn.isAfter(lateTime)) {
            record.setWorkStatus("LATE");
        } else {
            record.setWorkStatus("NORMAL");
        }

        // 2️⃣ 근무 시간 계산 (분 단위)
        long totalMinutes = java.time.Duration.between(checkIn, checkOut).toMinutes();

        // 3️⃣ 정상 근무 시간, 초과 근무, 미지급 시간 계산
        long normalMinutes = Math.min(totalMinutes, java.time.Duration.between(checkIn, overtimeTime).toMinutes());
        long overtimeMinutes = Math.max(0, totalMinutes - java.time.Duration.between(checkIn, overtimeTime).toMinutes());

        record.setNormalWorkMinutes((int) normalMinutes);
        record.setOvertimeWorkMinutes((int) overtimeMinutes);

        // 미지급 시간 (예: 조퇴, 결근 등)
        long unpaidMinutes = 0;
        if (checkOut.isBefore(startTime)) {
            unpaidMinutes = java.time.Duration.between(checkOut, startTime).toMinutes();
        }
        record.setUnpaidMinutes((int) unpaidMinutes);

        // 4️⃣ 총 근무 시간
        record.setTotalWorkMinutes((int) (normalMinutes + overtimeMinutes));
    }
}
