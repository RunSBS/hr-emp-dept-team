package boot.team.hr.ho.service;

import boot.team.hr.ho.entity.ApprovalLine;
import boot.team.hr.ho.repository.ApprovalLineRepository;
import boot.team.hr.ho.repository.EmpRole;
import boot.team.hr.hyun.emp.entity.Emp;
import boot.team.hr.hyun.emp.repo.EmpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ApprovalLineServiceImpl implements ApprovalLineService {

    private final EmpRepository empRepository;
    private final ApprovalLineRepository approvalLineRepository;

    @Override
    public void createApprovalLines(
            Long approvalId,
            Emp requester,
            Long typeId
    ) {
        int step = 1;

        // 팀장
        Emp leader = empRepository
                .findFirstByDept_DeptNoAndEmpRole(
                        requester.getDept().getDeptNo(),
                        EmpRole.LEADER.name()
                )
                .orElseThrow(() -> new IllegalStateException("팀장 없음"));

        saveLine(approvalId, leader, step++, true);

        // 담당관
        EmpRole officerRole = resolveOfficerRole(typeId);

        Emp officer = empRepository
                .findFirstByEmpRole(officerRole.name())
                .orElseThrow(() -> new IllegalStateException("담당관 없음"));

        saveLine(approvalId, officer, step++, false);

        // CEO
        Emp ceo = empRepository
                .findFirstByEmpRole(EmpRole.CEO.name())
                .orElseThrow(() -> new IllegalStateException("CEO 없음"));

        saveLine(approvalId, ceo, step, false);
    }

    private void saveLine(Long approvalId, Emp emp, int step, boolean current) {
        approvalLineRepository.save(
                ApprovalLine.create(
                        approvalId,
                        emp.getEmpId(),
                        emp.getEmpName(),
                        step,
                        current
                )
        );
    }

    private EmpRole resolveOfficerRole(Long typeId) {
        return switch (typeId.intValue()) {
            case 10 -> EmpRole.ATTENDANCE;
            case 20 -> EmpRole.REWARD;
            case 30 -> EmpRole.ATTENDANCE;
            case 40 -> EmpRole.EVAL;
            case 50 -> EmpRole.SCHEDULE;
            default -> throw new IllegalArgumentException("알 수 없는 결재 타입");
        };
    }
}
