package boot.team.hr.eun.leave.service;

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

import java.util.List;
import java.time.temporal.ChronoUnit;
import java.time.LocalDate;


@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class LeaveServiceImpl implements LeaveService {

    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final EmpRepository empRepository;

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
    @Transactional
    public void requestLeave(String email, LeaveRequestCreateDto dto) {

        log.info("leave request email = {}", email);

        Emp emp = empRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("직원 정보를 찾을 수 없습니다."));

        String empId = emp.getEmpId();
        log.info("mapped empId = {}", empId);

        LeaveType leaveType = leaveTypeRepository.findById(dto.getLeaveTypeId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 휴가 타입입니다."));

        int leaveMinutes = calculateLeaveMinutes(dto);

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

        // 1️⃣ email → emp 변환 (Attendance와 동일)
        Emp emp = empRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("직원 정보를 찾을 수 없습니다."));

        String empId = emp.getEmpId();

        // 2️⃣ empId 기준 조회
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
    =============================== */
    private int calculateLeaveMinutes(LeaveRequestCreateDto dto) {
        LocalDate start = dto.getStartDate();
        LocalDate end = dto.getEndDate();

        if (start == null || end == null) {
            throw new IllegalArgumentException("휴가 시작일과 종료일은 필수입니다.");
        }

        if (end.isBefore(start)) {
            throw new IllegalArgumentException("종료일은 시작일보다 빠를 수 없습니다.");
        }

        // (종료일 - 시작일) + 1 → 포함 계산
        long days = ChronoUnit.DAYS.between(start, end) + 1;

        // 1일 = 8시간 = 480분 (정책 기준)
        return (int) (days * 8 * 60);
    }



}
