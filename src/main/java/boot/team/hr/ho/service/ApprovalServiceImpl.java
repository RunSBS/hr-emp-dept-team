package boot.team.hr.ho.service;

import boot.team.hr.ho.dto.*;
import boot.team.hr.ho.entity.*;
import boot.team.hr.ho.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ApprovalServiceImpl implements ApprovalService {

    private final ApprovalDocRepository approvalDocRepository;
    private final ApprovalLineRepository approvalLineRepository;
    private final ApprovalFileRepository approvalFileRepository;
    private final ApprovalLogRepository approvalLogRepository;
    private final ApprovalLineService approvalLineService;

    // =============================
    // 1. 결재 신청
    @Override
    public ApprovalResponseDto createApproval(ApprovalRequestDto request) {

        // 신청자 검증
        if (request.getEmpId() == null) {
            throw new IllegalArgumentException("결재 신청자(empId)는 필수입니다.");
        }

        ApprovalDoc doc = ApprovalDoc.create(
                request.getEmpId(),
                request.getTypeId(),
                request.getTitle(),
                request.getContent()
        );
        approvalDocRepository.save(doc);

        approvalLineService.createApprovalLines(
                doc.getApprovalId(),
                request.getEmpId()
        );


        // 첨부파일
        if (request.getFiles() != null && !request.getFiles().isEmpty()) {
            List<ApprovalFile> files = request.getFiles().stream()
                    .map(f -> ApprovalFile.create(
                            doc.getApprovalId(),
                            f.getFileName(),
                            f.getFilePaths(),
                            f.getFileSize()
                    ))
                    .collect(Collectors.toList());

            approvalFileRepository.saveAll(files);
        }

        // 신청 로그
        approvalLogRepository.save(
                ApprovalLog.create(
                        doc.getApprovalId(),
                        request.getEmpId(),
                        "REQUEST",
                        "결재 신청"
                )
        );

        return mapToResponseDto(doc);
    }


    // =============================
    // 2. 결재 상세 조회
    @Override
    @Transactional(readOnly = true)
    public ApprovalResponseDto getApproval(Long approvalId) {
        ApprovalDoc doc = approvalDocRepository.findById(approvalId)
                .orElseThrow(() -> new IllegalArgumentException("결재 문서를 찾을 수 없습니다."));
        return mapToResponseDto(doc);
    }

    // =============================
    // 3. 결재 승인
    @Override
    public void approveApproval(ApprovalActionDto request) {

        ApprovalDoc doc = approvalDocRepository.findById(request.getApprovalId())
                .orElseThrow(() -> new IllegalArgumentException("결재 문서를 찾을 수 없습니다."));

        ApprovalLine current =
                approvalLineRepository.findByApprovalIdAndCurrentTrue(doc.getApprovalId());

        if (!current.getEmpId().equals(request.getEmpId())) {
            throw new IllegalStateException("현재 결재자가 아닙니다.");
        }

        current.deactivate();

        ApprovalLine next =
                approvalLineRepository.findByApprovalIdAndStepOrder(
                        doc.getApprovalId(),
                        current.getStepOrder() + 1
                );

        if (next != null) {
            next.activate();
        } else {
            doc.approve();
            approvalDocRepository.saveAndFlush(doc);
        }

        approvalLogRepository.save(
                ApprovalLog.create(
                        doc.getApprovalId(),
                        request.getEmpId(),
                        "APPROVED",
                        request.getComment()
                )
        );
    }

    // =============================
    // 4. 결재 반려
    @Override
    public void rejectApproval(ApprovalActionDto request) {

        ApprovalDoc doc = approvalDocRepository.findById(request.getApprovalId())
                .orElseThrow(() -> new IllegalArgumentException("결재 문서를 찾을 수 없습니다."));

        ApprovalLine current =
                approvalLineRepository.findByApprovalIdAndCurrentTrue(doc.getApprovalId());

        if (!current.getEmpId().equals(request.getEmpId())) {
            throw new IllegalStateException("현재 결재자가 아닙니다.");
        }

        current.deactivate();
        doc.reject();

        approvalLogRepository.save(
                ApprovalLog.create(
                        doc.getApprovalId(),
                        request.getEmpId(),
                        "REJECTED",
                        request.getComment()
                )
        );
    }

    // =============================
    // 5. 결재 취소
    @Override
    public void cancelApproval(ApprovalActionDto request) {

        ApprovalDoc doc = approvalDocRepository.findById(request.getApprovalId())
                .orElseThrow(() -> new IllegalArgumentException("결재 문서를 찾을 수 없습니다."));

        if (!doc.getEmpId().equals(request.getEmpId())) {
            throw new IllegalStateException("신청자만 결재를 취소할 수 있습니다.");
        }

        if (doc.getStatus() != ApprovalStatus.WAIT) {
            throw new IllegalStateException("이미 처리된 결재는 취소할 수 없습니다.");
        }


        doc.cancel();

        ApprovalLine current =
                approvalLineRepository.findByApprovalIdAndCurrentTrue(doc.getApprovalId());

        if (current != null) {
            current.deactivate();
        }

        approvalLogRepository.save(
                ApprovalLog.create(
                        doc.getApprovalId(),
                        request.getEmpId(),
                        "CANCELLED",
                        request.getComment()
                )
        );
    }



    // =============================
    // 7. 결재 이력
    @Override
    @Transactional(readOnly = true)
    public List<ApprovalResponseDto> getApprovalHistory(String empId) {
        int page = 0;   // 기본 페이지
        int size = 10;  // 기본 사이즈 (프론트에서 10개씩 보는 구조)

        return getApprovalHistory(empId, page, size);
    }


    @Override
    @Transactional(readOnly = true)
    public List<ApprovalResponseDto> getApprovalHistory(
            String empId, int page, int size
    ) {
        // 1. 내가 기안한 문서
        List<ApprovalResponseDto> requesterDocs =
                approvalDocRepository.findByEmpIdAndStatusIn(
                                empId,
                                List.of(
                                        ApprovalStatus.APPROVED,
                                        ApprovalStatus.REJECTED,
                                        ApprovalStatus.CANCELLED
                                )
                        ).stream()
                        .map(this::mapToResponseDto)
                        .collect(Collectors.toList());

        // 2. 내가 결재한 문서
        List<ApprovalResponseDto> approverDocs =
                approvalLineRepository.findByEmpId(empId)
                        .stream()
                        .map(line ->
                                approvalDocRepository.findById(line.getApprovalId()).orElse(null)
                        )
                        .filter(doc ->
                                doc != null &&
                                        !doc.getEmpId().equals(empId) &&
                                        doc.getStatus() != ApprovalStatus.WAIT
                        )
                        .map(this::mapToResponseDto)
                        .collect(Collectors.toList());

        requesterDocs.addAll(approverDocs);

        return slice(requesterDocs, page, size);
    }


    // =============================
    // 8. 내가 결재해야 할 문서
    @Override
    @Transactional(readOnly = true)
    public List<ApprovalResponseDto> getPendingToApprove(String empId) {
        int page = 0;
        int size = 10;

        return getPendingToApprove(empId, page, size);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApprovalResponseDto> getPendingToApprove(
            String empId, int page, int size
    ) {
        List<ApprovalResponseDto> list =
                approvalLineRepository.findByEmpIdAndCurrentTrue(empId)
                        .stream()
                        .map(line ->
                                approvalDocRepository.findById(line.getApprovalId()).orElse(null)
                        )
                        .filter(doc -> doc != null)
                        .map(this::mapToResponseDto)
                        .collect(Collectors.toList());

        return slice(list, page, size);
    }


    // =============================
    // 9. 내가 올린 문서 중 대기중
    @Override
    @Transactional(readOnly = true)
    public List<ApprovalResponseDto> getPendingRequested(String empId) {
        int page = 0;
        int size = 10;

        return getPendingRequested(empId, page, size);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApprovalResponseDto> getPendingRequested(
            String empId, int page, int size
    ) {
        List<ApprovalResponseDto> list =
                approvalDocRepository.findByEmpIdAndStatus(empId, ApprovalStatus.WAIT)
                        .stream()
                        .map(this::mapToResponseDto)
                        .collect(Collectors.toList());

        return slice(list, page, size);
    }


    // =============================
    // DTO 매핑
    private ApprovalResponseDto mapToResponseDto(ApprovalDoc doc) {

        List<LineDto> lines =
                approvalLineRepository.findByApprovalIdOrderByStepOrder(doc.getApprovalId())
                        .stream()
                        .map(l -> {
                            LineDto dto = new LineDto();
                            dto.setLineId(l.getLineId());
                            dto.setEmpId(l.getEmpId());
                            dto.setEmpName(l.getEmpName());
                            dto.setStepOrder(l.getStepOrder());
                            dto.setCurrent(l.isCurrent());
                            dto.setActionAt(l.getActionAt());
                            return dto;
                        }).collect(Collectors.toList());

        List<FileDto> files =
                approvalFileRepository.findByApprovalId(doc.getApprovalId())
                        .stream()
                        .map(f -> {
                            FileDto dto = new FileDto();
                            dto.setFileName(f.getFileName());
                            dto.setFilePaths(f.getFilePaths());
                            dto.setFileSize(f.getFileSize());
                            return dto;
                        }).collect(Collectors.toList());

        List<LogDto> logs =
                approvalLogRepository.findByApprovalIdOrderByLogId(doc.getApprovalId())
                        .stream()
                        .map(l -> {
                            LogDto dto = new LogDto();
                            dto.setLogId(l.getLogId());
                            dto.setEmpId(l.getEmpId());
                            dto.setAction(l.getAction());
                            dto.setComment(l.getComment());
                            dto.setCreatedAt(l.getCreatedAt());
                            return dto;
                        }).collect(Collectors.toList());

        ApprovalResponseDto response = new ApprovalResponseDto();
        response.setApprovalId(doc.getApprovalId());
        response.setEmpId(doc.getEmpId());
        response.setTypeId(doc.getTypeId());
        response.setTitle(doc.getTitle());
        response.setContent(doc.getContent());
        response.setStatus(doc.getStatus().name());
        response.setCreatedAt(doc.getCreatedAt());
        response.setUpdatedAt(doc.getUpdatedAt());
        response.setLines(lines);
        response.setFiles(files);
        response.setLogs(logs);

        return response;
    }

    private <T> List<T> slice(List<T> list, int page, int size) {
        int start = page * size;
        if (start >= list.size()) {
            return List.of();
        }
        int end = Math.min(start + size, list.size());
        return list.subList(start, end);
    }

}
