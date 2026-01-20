package boot.team.hr.eun.attendance.service;

import boot.team.hr.eun.attendance.dto.AttendanceListResponseDto;
import boot.team.hr.eun.attendance.entity.WorkRecord;
import boot.team.hr.eun.attendance.repo.WorkRecordRepository;
import boot.team.hr.hyun.emp.entity.Emp;
import boot.team.hr.hyun.emp.repo.EmpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AttendanceQueryServiceImpl implements AttendanceQueryService {

    private final WorkRecordRepository workRecordRepository;
    private final EmpRepository empRepository;

    /* ===============================
       사원 본인 근태 조회
    =============================== */
    @Override
    public List<AttendanceListResponseDto> getMyAttendance(
            String email,
            LocalDate startDate,
            LocalDate endDate
    ) {

        Emp emp = empRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("사원 정보를 찾을 수 없습니다.")
                );

        return workRecordRepository
                .findByEmployeeIdAndWorkDateBetween(
                        emp.getEmpId(), startDate, endDate
                )
                .stream()
                .map(r -> AttendanceListResponseDto.from(r, emp))
                .toList();
    }

    /* ===============================
       관리자 전체 근태 조회
    =============================== */
    @Override
    public List<AttendanceListResponseDto> getAllAttendance(
            String empId,
            LocalDate startDate,
            LocalDate endDate
    ) {
        // 날짜가 안 들어오면 기본값 설정 (예: 최근 30일)
        LocalDate start = (startDate != null) ? startDate : LocalDate.now().minusDays(30);
        LocalDate end = (endDate != null) ? endDate : LocalDate.now();

        // 1️⃣ 근태 조회
        List<WorkRecord> records =
                (empId == null || empId.isBlank())
                        ? workRecordRepository.findByWorkDateBetween(start, end)
                        : workRecordRepository.findByEmployeeIdAndWorkDateBetween(
                        empId, start, end
                );

        if (records.isEmpty()) {
            return List.of();
        }

        // 2️⃣ empId 목록 추출
        List<String> empIds = records.stream()
                .map(WorkRecord::getEmployeeId)
                .distinct()
                .toList();

        // 3️⃣ Emp 일괄 조회
        Map<String, Emp> empMap = empRepository.findByEmpIdIn(empIds)
                .stream()
                .collect(Collectors.toMap(Emp::getEmpId, e -> e));

        // 4️⃣ DTO 변환
        return records.stream()
                .map(r -> AttendanceListResponseDto.from(
                        r,
                        empMap.get(r.getEmployeeId())
                ))
                .toList();
    }
}

