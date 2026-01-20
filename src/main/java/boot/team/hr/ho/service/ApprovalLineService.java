package boot.team.hr.ho.service;

import boot.team.hr.ho.entity.ApprovalLine;
import boot.team.hr.ho.repository.ApprovalLineRepository;
import boot.team.hr.ho.repository.EmpRoleRepository;
import boot.team.hr.hyun.emp.entity.Emp;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ApprovalLineService {

    private final ApprovalLineRepository approvalLineRepository;
    private final EmpRoleRepository empRoleRepository;

    public void createApprovalLines(Long approvalId, String requesterEmpId) {

        System.out.println("===== 결재선 자동 생성 시작 =====");
        System.out.println("approvalId = " + approvalId);
        System.out.println("requesterEmpId = " + requesterEmpId);

        try {
            // 1️⃣ 기안자
            Emp requester = empRoleRepository.findByEmpId(requesterEmpId)
                    .orElseThrow(() -> new IllegalStateException("기안자 없음"));

            System.out.println("기안자 조회 성공: " + requester.getEmpId());

            // 2️⃣ 팀장
            if (requester.getManagerId() == null) {
                throw new IllegalStateException("팀장 정보 없음 (managerId is null)");
            }

            System.out.println("팀장 empId = " + requester.getManagerId());

            Emp teamLeader = empRoleRepository.findByEmpId(requester.getManagerId())
                    .orElseThrow(() -> new IllegalStateException("팀장 없음"));

            System.out.println("팀장 조회 성공: " + teamLeader.getEmpId());

            // 3️⃣ 본부장
            Emp director = empRoleRepository
                    .findFirstByEmpRole("DIRECTOR")
                    .orElseThrow(() -> new IllegalStateException("본부장 없음"));

            System.out.println("본부장 조회 성공: " + director.getEmpId());

            // 4️⃣ 결재선 생성
            ApprovalLine line1 = ApprovalLine.create(
                    approvalId,
                    teamLeader.getEmpId(),
                    teamLeader.getEmpName(),
                    1,
                    true
            );

            ApprovalLine line2 = ApprovalLine.create(
                    approvalId,
                    director.getEmpId(),
                    director.getEmpName(),
                    2,
                    false
            );

            approvalLineRepository.saveAll(List.of(line1, line2));

            System.out.println("결재선 생성 완료");

        } catch (Exception e) {
            // ❗ 여기서 예외를 삼켜서 전체 결재 신청이 실패하지 않게 함
            System.out.println("⚠️ 결재선 자동 생성 실패");
            System.out.println("사유: " + e.getMessage());
            e.printStackTrace();
        }

        System.out.println("===== 결재선 자동 생성 종료 =====");
    }
}
