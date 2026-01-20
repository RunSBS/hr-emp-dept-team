package boot.team.hr.ho.entity;

import boot.team.hr.ho.repository.EmpRole;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "APPROVAL_LINE_POLICY")
@Getter
public class ApprovalLinePolicy {

    @Id
    private Long policyId;

    private Long typeId;

    private int stepOrder;

    @Enumerated(EnumType.STRING)
    private EmpRole roleCode;
}
