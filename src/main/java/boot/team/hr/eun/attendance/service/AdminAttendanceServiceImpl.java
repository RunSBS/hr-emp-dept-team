package boot.team.hr.eun.attendance.service;

import boot.team.hr.eun.attendance.dto.AdminAttendanceUpdateRequestDto;
import boot.team.hr.eun.attendance.dto.AttendanceResponseDto;
import boot.team.hr.eun.attendance.entity.AttendancePolicy;
import boot.team.hr.eun.attendance.entity.WorkRecord;
import boot.team.hr.eun.attendance.enums.WorkType;
import boot.team.hr.eun.attendance.repo.AttendancePolicyRepository;
import boot.team.hr.eun.attendance.repo.WorkRecordRepository;
import boot.team.hr.eun.attendance.util.AttendanceTimeCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminAttendanceServiceImpl implements AdminAttendanceService {

    private final WorkRecordRepository workRecordRepository;
    private final AttendancePolicyRepository policyRepository;

    @Override
    public AttendanceResponseDto updateCheckOut(AdminAttendanceUpdateRequestDto req) {

        if (req.getEmpId() == null || req.getEmpId().isBlank()) {
            throw new IllegalArgumentException("empId가 필요합니다.");
        }
        if (req.getWorkDate() == null || req.getWorkDate().isBlank()) {
            throw new IllegalArgumentException("workDate가 필요합니다.");
        }
        if (req.getCheckOut() == null || req.getCheckOut().isBlank()) {
            throw new IllegalArgumentException("checkOut(LocalDateTime)가 필요합니다.");
        }

        LocalDate workDate = LocalDate.parse(req.getWorkDate());
        LocalDateTime newCheckOut = LocalDateTime.parse(req.getCheckOut());

        WorkRecord record = workRecordRepository.findByEmployeeIdAndWorkDate(req.getEmpId(), workDate)
                .orElseThrow(() -> new IllegalStateException("해당 날짜의 근무 레코드를 찾을 수 없습니다."));

        // 휴가/외근은 퇴근 개념 없음(프론트/백 모두 동일 정책)
        if (record.getWorkType() == WorkType.LEAVE || record.getWorkType() == WorkType.OUTSIDE) {
            throw new IllegalStateException("휴가/외근 레코드는 퇴근 시간을 수정할 수 없습니다.");
        }

        if (record.getCheckIn() == null) {
            throw new IllegalStateException("출근 시간이 없는 레코드는 퇴근 시간을 수정할 수 없습니다.");
        }

        if (newCheckOut.isBefore(record.getCheckIn())) {
            throw new IllegalStateException("퇴근 시간이 출근 시간보다 빠를 수 없습니다.");
        }

        AttendancePolicy policy = policyRepository.findPolicyByWorkDate(workDate)
                .orElseThrow(() -> new IllegalStateException("적용 가능한 근태 정책이 없습니다."));

        // 1) checkOut 업데이트
        record.setCheckOut(newCheckOut);

        // 2) 분 계산 다시
        var time = AttendanceTimeCalculator.calculateAtCheckOut(
                record.getCheckIn(),
                newCheckOut,
                policy
        );

        record.setNormalWorkMinutes(time.normalWorkMinutes());
        record.setOvertimeWorkMinutes(time.overtimeWorkMinutes());
        record.setUnpaidMinutes(time.unpaidMinutes());
        record.setTotalWorkMinutes(time.totalWorkMinutes());

        // 3) 상태 재결정
        record.setWorkStatus(
                boot.team.hr.eun.attendance.enums.WorkStatus.decideAtCheckOut(
                        record.getWorkStatus(),
                        newCheckOut,
                        policy.getOvertimeStartLocalTime()
                )
        );

        // 4) 퇴근 처리니까 OFF로 마무리
        record.setWorkType(WorkType.OFF);

        return AttendanceResponseDto.builder()
                .workStatus(record.getWorkStatus())
                .workType(record.getWorkType())
                .build();
    }
}
