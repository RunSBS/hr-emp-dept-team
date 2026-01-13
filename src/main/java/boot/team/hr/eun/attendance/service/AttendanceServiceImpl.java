package boot.team.hr.eun.attendance.service;

import boot.team.hr.eun.attendance.dto.AttendanceRequestDto;
import boot.team.hr.eun.attendance.dto.AttendanceResponseDto;
import boot.team.hr.eun.attendance.entity.*;
import boot.team.hr.eun.attendance.repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Transactional
public class AttendanceServiceImpl implements AttendanceService {

    private final WorkRecordRepository workRecordRepository;
    private final AttendancePolicyRepository policyRepository;
    private final CompanyLocationRepository locationRepository;

    @Override
    public AttendanceResponseDto checkIn(
            Long employeeId,
            AttendanceRequestDto request
    ) {
        try {
            System.out.println("===== checkIn 호출 시작 =====");
            System.out.println("employeeId=" + employeeId);
            System.out.println("latitude=" + request.getLatitude() + ", longitude=" + request.getLongitude());

            // 1. 위치 체크
            CompanyLocation company = locationRepository
                    .findById(1L)
                    .orElseThrow(() -> new IllegalStateException("회사 위치 정보 없음"));
            System.out.println("회사 위치 정보 조회 완료: " +
                    "lat=" + company.getLatitude() +
                    ", lon=" + company.getLongitude() +
                    ", 허용 반경=" + company.getAllowedRadiusM());

            double distance = calculateDistance(
                    company.getLatitude(),
                    company.getLongitude(),
                    request.getLatitude(),
                    request.getLongitude()
            );
            System.out.println("계산된 거리: " + distance + "m");

            if (distance > company.getAllowedRadiusM()) {
                throw new IllegalStateException("회사 위치 범위 밖입니다.");
            }

            // 2. 오늘 출근 여부 확인
            workRecordRepository
                    .findByEmployeeIdAndWorkDate(employeeId, LocalDate.now())
                    .ifPresent(r -> {
                        throw new IllegalStateException("이미 출근 처리되었습니다.");
                    });
            System.out.println("오늘 출근 기록 없음 확인");

            // 3. 정책 조회
            AttendancePolicy policy = policyRepository.findCurrentPolicy();
            if (policy == null) {
                throw new IllegalStateException("적용 가능한 근태 정책이 없습니다.");
            }
            System.out.println("근태 정책 조회 완료: lateTime=" + policy.getLateTime());

            // 현재 시각 HHmm
            int nowTime = Integer.parseInt(
                    LocalDateTime.now()
                            .format(DateTimeFormatter.ofPattern("HHmm"))
            );
            System.out.println("현재 시간(HHmm)=" + nowTime);

            String status = (nowTime <= policy.getLateTime())
                    ? "NORMAL"
                    : "LATE";
            System.out.println("계산된 workStatus=" + status);

            // 4. 기록 저장
            WorkRecord record = WorkRecord.builder()
                    .employeeId(employeeId)
                    .workDate(LocalDate.now())
                    .checkIn(LocalDateTime.now())
                    .workStatus(status)
                    .workType("OFFICE")
                    .normalWorkMinutes(0)
                    .overtimeWorkMinutes(0)
                    .unpaidMinutes(0)
                    .totalWorkMinutes(0)
                    .build();

            workRecordRepository.save(record);
            System.out.println("WorkRecord 저장 완료: " + record);

            System.out.println("===== checkIn 완료 =====");

            return AttendanceResponseDto.builder()
                    .workStatus(status)
                    .workType("OFFICE")
                    .message("출근 처리 완료")
                    .success(true)
                    .build();

        } catch (Exception e) {
            System.err.println("===== checkIn 에러 발생 =====");
            e.printStackTrace();

            return AttendanceResponseDto.builder()
                    .success(false)
                    .message("출근 처리 중 오류가 발생했습니다: " + e.getMessage())
                    .workStatus(null)
                    .workType(null)
                    .build();
        }
    }

    // 거리 계산 (Haversine)
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
}
