package boot.team.hr.eun.leave.service;

import boot.team.hr.eun.attendance.repo.AttendancePolicyRepository;
import boot.team.hr.eun.attendance.util.AttendanceTimeCalculator;
import boot.team.hr.eun.leave.dto.LeaveRequestCreateDto;
import boot.team.hr.eun.leave.dto.LeaveRequestResponseDto;
import boot.team.hr.eun.leave.dto.LeaveTypeResponseDto;
import boot.team.hr.eun.leave.entity.LeaveRequest;
import boot.team.hr.eun.leave.entity.LeaveType;
import boot.team.hr.eun.leave.repo.LeaveRequestRepository;
import boot.team.hr.eun.leave.repo.LeaveTypeRepository;
import boot.team.hr.hyun.emp.entity.Emp;
import boot.team.hr.hyun.emp.repo.EmpRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class LeaveServiceImpl implements LeaveService {

    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final EmpRepository empRepository;

    // ✅ 추가: 정책 조회용
    private final AttendancePolicyRepository attendancePolicyRepository;

    /* ===============================
       휴가 유형 조회
    =============================== */
    @Override
    @Transactional(readOnly = true)
    public List<LeaveTypeResponseDto> getLeaveTypes() {
        return leaveTypeRepository.findByIsActive("Y").stream()
                .map(type -> new LeaveTypeResponseDto(
                        type.getLeaveTypeId(),
                        type.getLeaveName(),
                        "Y".equals(type.getIsPaid())
                ))
                .toList();
    }

    /* ===============================
       휴가 신청
    =============================== */
    @Override
    public void requestLeave(String email, LeaveRequestCreateDto dto) {

        log.info("leave request email = {}", email);

        Emp emp = empRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("직원 정보를 찾을 수 없습니다."));

        String empId = emp.getEmpId();
        log.info("mapped empId = {}", empId);

        LeaveType leaveType = leaveTypeRepository.findById(dto.getLeaveTypeId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 휴가 타입입니다."));

        // ✅ 수정: dto -> (leaveTypeId, startDate, endDate)로 계산
        int leaveMinutes = calculateLeaveMinutes(
                dto.getLeaveTypeId(),
                dto.getStartDate(),
                dto.getEndDate()
        );

        LeaveRequest leaveRequest = LeaveRequest.create(
                empId,
                leaveType,
                dto.getStartDate(),
                dto.getEndDate(),
                leaveMinutes,
                dto.getLeaveReason()
        );

        leaveRequestRepository.save(leaveRequest);
    }

    /* ===============================
       내 휴가 신청 목록
    =============================== */
    @Override
    @Transactional(readOnly = true)
    public List<LeaveRequestResponseDto> getMyLeaveRequests(String email) {

        Emp emp = empRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("직원 정보를 찾을 수 없습니다."));

        String empId = emp.getEmpId();

        return leaveRequestRepository
                .findByEmployeeIdOrderByCreatedAtDesc(empId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /* ===============================
       Entity → Response DTO
    =============================== */
    private LeaveRequestResponseDto toResponse(LeaveRequest request) {
        return LeaveRequestResponseDto.builder()
                .leaveId(request.getLeaveId())
                .leaveTypeName(request.getLeaveType().getLeaveName())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .leaveMinutes(request.getLeaveMinutes())
                .approvalStatus(request.getApprovalStatus())
                .leaveReason(request.getLeaveReason())
                .createdAt(request.getCreatedAt())
                .build();
    }

    /* ===============================
        휴가 시간 계산
        - 1(연차),3(병가),4(무급): "정상근무분 * 일수"
        - 5(AM),6(PM): "정상근무분 / 2" (휴게시간 제외 반영)
    =============================== */
    private int calculateLeaveMinutes(Long leaveTypeId, LocalDate startDate, LocalDate endDate) {

        if (leaveTypeId == null) throw new IllegalArgumentException("leaveTypeId가 필요합니다.");
        if (startDate == null || endDate == null) throw new IllegalArgumentException("시작일/종료일이 필요합니다.");
        if (endDate.isBefore(startDate)) throw new IllegalArgumentException("종료일은 시작일보다 빠를 수 없습니다.");

        // ✅ 반차(AM/PM)는 1일만 허용
        if ((leaveTypeId == 5L || leaveTypeId == 6L) && !startDate.equals(endDate)) {
            throw new IllegalArgumentException("반차(AM/PM)는 시작일과 종료일이 같아야 합니다.");
        }

        var policy = attendancePolicyRepository.findPolicyByWorkDate(startDate)
                .orElseThrow(() -> new IllegalStateException("적용 가능한 근태 정책이 없습니다."));

        int scheduled = AttendanceTimeCalculator.scheduledWorkMinutes(policy); // 휴게시간 제외된 정상근무분

        // 전일 휴가(연차/병가/무급)
        if (leaveTypeId == 1L || leaveTypeId == 3L || leaveTypeId == 4L) {
            long days = ChronoUnit.DAYS.between(startDate, endDate) + 1;
            return (int) (scheduled * days);
        }

        // 반차(AM/PM)
        if (leaveTypeId == 5L || leaveTypeId == 6L) {
            return scheduled / 2;
        }

        throw new IllegalArgumentException("지원하지 않는 leaveTypeId=" + leaveTypeId);
    }
}
