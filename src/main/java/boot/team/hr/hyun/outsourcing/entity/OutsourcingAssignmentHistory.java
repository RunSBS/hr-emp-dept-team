package boot.team.hr.hyun.outsourcing.entity;

import boot.team.hr.hyun.emp.entity.Emp;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// Entity
@Entity
@Table(name = "outsourcing_assignment_history")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OutsourcingAssignmentHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "assign_history_seq")
    @SequenceGenerator(name = "assign_history_seq", sequenceName = "seq_assign_history", allocationSize = 1)
    private Long assignHistoryId;

    private Long assignmentId;
    private String fieldName;
    private String beforeValue;
    private String afterValue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changer_id")
    private Emp changer;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() { this.createdAt = LocalDateTime.now(); }
}