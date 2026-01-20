package boot.team.hr.ho.service;

import boot.team.hr.ho.dto.ApprovalType;
import boot.team.hr.ho.entity.ApprovalLine;
import boot.team.hr.ho.entity.ApprovalLinePolicy;
import boot.team.hr.ho.repository.ApprovalLinePolicyRepository;
import boot.team.hr.ho.repository.ApprovalLineRepository;
import boot.team.hr.ho.repository.EmpRole;
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
    private final ApprovalLinePolicyRepository policyRepository;
    private final EmpRoleRepository empRoleRepository;

    public void createApprovalLines(
            Long approvalId,
            String requesterEmpId,
            Long typeId
    ) {
        Emp requester = empRoleRepository.findByEmpId(requesterEmpId)
                .orElseThrow(() -> new IllegalStateException("기안자 없음"));

        List<ApprovalLinePolicy> policies =
                policyRepository.findByTypeIdOrderByStepOrder(typeId);

        boolean first = true;

        for (ApprovalLinePolicy policy : policies) {

            Emp approver = resolveApprover(policy.getRoleCode(), requester);

            approvalLineRepository.save(
                    ApprovalLine.create(
                            approvalId,
                            approver.getEmpId(),
                            approver.getEmpName(),
                            policy.getStepOrder(),
                            first
                    )
            );
            first = false;
        }
    }

    private Emp resolveApprover(EmpRole role, Emp requester) {

        if (role == EmpRole.TEAM_LEADER) {
            return empRoleRepository.findByEmpId(requester.getManagerId())
                    .orElseThrow(() -> new IllegalStateException("팀장 없음"));
        }

        return empRoleRepository.findFirstByEmpRole(role)
                .orElseThrow(() -> new IllegalStateException(role + " 없음"));
    }
}

