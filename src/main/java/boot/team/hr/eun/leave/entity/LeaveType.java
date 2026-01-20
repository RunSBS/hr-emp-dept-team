package boot.team.hr.eun.leave.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "LEAVE_TYPE")
@Getter
@NoArgsConstructor
public class LeaveType {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "leave_type_seq")
    @SequenceGenerator(
            name = "leave_type_seq",
            sequenceName = "SEQ_LEAVE_TYPE",
            allocationSize = 1
    )
    @Column(name = "leave_type_id")
    private Long leaveTypeId;

    @Column(name = "leave_name", nullable = false, length = 30)
    private String leaveName;

    @Column(name = "is_paid", nullable = false, length = 1)
    private String isPaid; // Y / N

    @Column(name = "is_active", nullable = false, length = 1)
    private String isActive; // Y / N
}
