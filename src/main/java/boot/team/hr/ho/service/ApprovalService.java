package boot.team.hr.ho.service;

import boot.team.hr.ho.dto.*;
import java.util.List;

public interface ApprovalService {

    // 1. 결재 신청
    ApprovalResponseDto createApproval(ApprovalRequestDto request);

    // 2. 결재 상세 조회
    ApprovalResponseDto getApproval(Long approvalId);

    // 3. 결재 승인
    void approveApproval(ApprovalActionDto request);

    // 4. 결재 반려
    void rejectApproval(ApprovalActionDto request);

    // 5. 결재 취소
    void cancelApproval(ApprovalActionDto request);

    // History.jsx
    List<ApprovalResponseDto> getApprovalHistory(String empId);
    List<ApprovalResponseDto> getApprovalHistory(String empId, int page, int size);


    // Pending.jsx - 내가 결재해야 할 문서
    List<ApprovalResponseDto> getPendingToApprove(String empId);
    List<ApprovalResponseDto> getPendingToApprove(String empId, int page, int size);

    // Pending.jsx - 내가 올린 문서 중 대기중
    List<ApprovalResponseDto> getPendingRequested(String empId);
    List<ApprovalResponseDto> getPendingRequested(String empId, int page, int size);

}
