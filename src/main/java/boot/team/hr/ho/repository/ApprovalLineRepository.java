package boot.team.hr.ho.repository;

import boot.team.hr.ho.entity.ApprovalLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApprovalLineRepository extends JpaRepository<ApprovalLine, Long> {

    // 특정 문서의 결재선 전체 조회 (step 순서대로)
    List<ApprovalLine> findByApprovalIdOrderByStepOrder(Long approvalId);

    // 현재 차례인 결재선 조회
    ApprovalLine findByApprovalIdAndCurrentTrue(Long approvalId);

    // 특정 step 조회
    ApprovalLine findByApprovalIdAndStepOrder(Long approvalId, Integer stepOrder);

    List<ApprovalLine> findByEmpId(String empId);

    // 현재 결재자인 문서 조회 (내가 결재해야 할 문서)
    List<ApprovalLine> findByEmpIdAndCurrentTrue(String empId);
}