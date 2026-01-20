package boot.team.hr.ho.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "APPROVAL_LINE")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ApprovalLine {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "approval_line_seq")
    @SequenceGenerator(
            name = "approval_line_seq",
            sequenceName = "SEQ_APPROVAL_LINE",
            allocationSize = 1
    )
    private Long lineId;

    @Column(nullable = false)
    private Long approvalId;

    @Column(nullable = false)
    private String empId;

    private String empName;

    @Column(nullable = false)
    private Integer stepOrder;

    @Column(name = "IS_CURRENT", nullable = false)
    private boolean current;

    private LocalDateTime actionAt;

    public boolean isCurrent() {
        return current;
    }

    public void activate() {
        this.current = true;
    }

    public void deactivate() {
        this.current = false;
        this.actionAt = LocalDateTime.now();
    }

    public static ApprovalLine create(
            Long approvalId,
            String empId,
            String empName,
            Integer stepOrder,
            boolean isCurrent
    ) {
        ApprovalLine line = new ApprovalLine();
        line.approvalId = approvalId;
        line.empId = empId;
        line.empName = empName;
        line.stepOrder = stepOrder;
        line.current = isCurrent;
        line.actionAt = null;
        return line;
    }
}
