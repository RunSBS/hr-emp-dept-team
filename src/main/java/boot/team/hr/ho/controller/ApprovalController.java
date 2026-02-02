package boot.team.hr.ho.controller;

import boot.team.hr.ho.dto.*;
import boot.team.hr.ho.repository.ApprovalTypeRepository;
import boot.team.hr.ho.service.ApprovalService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.core.io.Resource;


import java.net.URLEncoder;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/ho/approvals")
@RequiredArgsConstructor
public class ApprovalController {

    private final ApprovalService approvalService;
    private final ApprovalTypeRepository approvalTypeRepository;

    // 0. 결재 유형 조회 (Request.jsx)
    @GetMapping("/type")
    public List<ApprovalTypeDto> getApprovalTypes() {
        return approvalTypeRepository.findAll().stream()
                .map(t -> new ApprovalTypeDto(t.getTypeId(), t.getTypeName(), t.getDescription()))
                .toList();
    }

    // -----------------------------
    // 1. 결재 신청 (Request.jsx)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApprovalResponseDto> createApproval(
            @RequestPart("data") String data,
            @RequestPart(value = "files", required = false) List<MultipartFile> files
    ) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();

            ApprovalRequestDto requestDto =
                    objectMapper.readValue(data, ApprovalRequestDto.class);

            ApprovalResponseDto response =
                    approvalService.createApproval(requestDto, files);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }


    // -----------------------------
    // 2. 결재 이력 (History.jsx)
    // 내가 올린 문서 중 완료/반려/취소
    @GetMapping("/history")
    public ResponseEntity<List<ApprovalResponseDto>> getApprovalHistory(
            @RequestParam String empId
    ) {
        List<ApprovalResponseDto> list =
                approvalService.getApprovalHistory(empId);
        return ResponseEntity.ok(list);
    }

    // -----------------------------
    // 3-1. 결재 대기 - 내가 결재해야 할 문서 (Pending.jsx)
    @GetMapping("/pending/approve")
    public ResponseEntity<List<ApprovalResponseDto>> getPendingToApprove(
            @RequestParam String empId
    ) {
        List<ApprovalResponseDto> list =
                approvalService.getPendingToApprove(empId);
        return ResponseEntity.ok(list);
    }

    // -----------------------------
    // 3-2. 결재 대기 - 내가 올린 문서 중 대기중 (Pending.jsx)
    @GetMapping("/pending/request")
    public ResponseEntity<List<ApprovalResponseDto>> getPendingRequested(
            @RequestParam String empId
    ) {
        List<ApprovalResponseDto> list =
                approvalService.getPendingRequested(empId);
        return ResponseEntity.ok(list);
    }

    // -----------------------------
    // 4. 결재 상세 조회 (Detail.jsx)
    @GetMapping("/{approvalId}")
    public ResponseEntity<ApprovalResponseDto> getApproval(
            @PathVariable Long approvalId
    ) {
        ApprovalResponseDto response =
                approvalService.getApproval(approvalId);
        return ResponseEntity.ok(response);
    }

    // -----------------------------
    // 5. 결재 승인
    @PostMapping("/{approvalId}/approve")
    public ResponseEntity<Void> approveApproval(
            @PathVariable Long approvalId,
            @RequestBody ApprovalActionDto request
    ) {
        request.setApprovalId(approvalId);
        approvalService.approveApproval(request);
        return ResponseEntity.ok().build();
    }

    // -----------------------------
    // 6. 결재 반려
    @PostMapping("/{approvalId}/reject")
    public ResponseEntity<Void> rejectApproval(
            @PathVariable Long approvalId,
            @RequestBody ApprovalActionDto request
    ) {
        request.setApprovalId(approvalId);
        approvalService.rejectApproval(request);
        return ResponseEntity.ok().build();
    }

    // -----------------------------
    // 7. 결재 취소
    @PostMapping("/{approvalId}/cancel")
    public ResponseEntity<Void> cancelApproval(
            @PathVariable Long approvalId,
            @RequestBody ApprovalActionDto request
    ) {
        request.setApprovalId(approvalId);
        approvalService.cancelApproval(request);
        return ResponseEntity.ok().build();
    }
    //8. 파일 다운로드
    @GetMapping("/files/download")
    public ResponseEntity<Resource> downloadFile(@RequestParam String path) {
        try {
            Path filePath = Paths.get(path).toAbsolutePath().normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            // 실제 파일 이름 추출
            String fileName = filePath.getFileName().toString();

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + URLEncoder.encode(fileName, "UTF-8") + "\"")
                    .body(resource);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

}
