package boot.team.hr.gyu.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "REWARD_CANDIDATE")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RewardCandidate {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "candidate_seq")
    @SequenceGenerator(
            name = "candidate_seq",
            sequenceName = "REWARD_CANDIDATE_SEQ",
            allocationSize = 1
    )
    @Column(name = "CANDIDATE_ID")
    private Long candidateId;

    @Column(name = "POLICY_ID", nullable = false)
    private Long policyId;

    @Column(name = "NOMINATOR_ID", nullable = false, length = 20)
    private String nominatorId;

    @Column(name = "NOMINEE_ID", nullable = false, length = 20)
    private String nomineeId;

    @Column(name = "NOMINATION_TYPE", nullable = false, length = 10)
    private String nominationType;

    @Column(name = "REASON", length = 500)
    private String reason;

    @Column(name = "REWARD_AMOUNT", nullable = false)
    private Long rewardAmount;

    @Column(name = "STATUS", nullable = false, length = 20)
    private String status;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "PENDING";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}