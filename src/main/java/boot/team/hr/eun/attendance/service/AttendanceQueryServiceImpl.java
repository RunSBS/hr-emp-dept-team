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
            String empName,
            LocalDate startDate,
            LocalDate endDate
    ) {
        LocalDate start = (startDate != null) ? startDate : LocalDate.now().minusDays(30);
        LocalDate end = (endDate != null) ? endDate : LocalDate.now();

        // 0) 이름 필터가 있으면 empId 후보 리스트부터 만든다
        List<String> nameFilteredEmpIds = null;
        if (empName != null && !empName.isBlank()) {
            nameFilteredEmpIds = empRepository
                    .findByEmpNameContainingIgnoreCase(empName)  // ✅ EmpRepository에 메서드 추가 필요(아래)
                    .stream()
                    .map(Emp::getEmpId)
                    .distinct()
                    .toList();

            if (nameFilteredEmpIds.isEmpty()) {
                return List.of();
            }
        }

        // 1) 근태 조회
        List<WorkRecord> records;

        // empId가 명시되면 empId 우선
        if (empId != null && !empId.isBlank()) {
            records = workRecordRepository.findByEmployeeIdAndWorkDateBetween(empId, start, end);
        } else if (nameFilteredEmpIds != null) {
            // 이름으로 필터링된 empId들
            records = workRecordRepository.findByEmployeeIdInAndWorkDateBetween(nameFilteredEmpIds, start, end); // ✅ repo 추가(아래)
        } else {
            // 전체
            records = workRecordRepository.findByWorkDateBetween(start, end);
        }

        if (records.isEmpty()) return List.of();

        // 2) Emp 매핑
        List<String> empIds = records.stream()
                .map(WorkRecord::getEmployeeId)
                .distinct()
                .toList();

        Map<String, Emp> empMap = empRepository.findByEmpIdIn(empIds)
                .stream()
                .collect(Collectors.toMap(Emp::getEmpId, e -> e));

        // 3) DTO 변환
        return records.stream()
                .map(r -> AttendanceListResponseDto.from(r, empMap.get(r.getEmployeeId())))
                .toList();
    }
}

