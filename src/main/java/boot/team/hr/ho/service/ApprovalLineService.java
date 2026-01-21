package boot.team.hr.ho.service;

import boot.team.hr.hyun.emp.entity.Emp;

public interface ApprovalLineService {

    void createApprovalLines(
            Long approvalId,
            Emp requester,
            Long typeId
    );
}
