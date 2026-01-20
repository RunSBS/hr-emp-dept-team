package boot.team.hr.gyu.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "REWARD_POLICY")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RewardPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "policy_seq")
    @SequenceGenerator(
            name = "policy_seq",
            sequenceName = "REWARD_POLICY_SEQ",
            allocationSize = 1
    )
    @Column(name = "POLICY_ID")
    private Long policyId;

    @Column(name = "POLICY_NAME", nullable = false, length = 100)
    private String policyName;

    @Column(name = "REWARD_TYPE", nullable = false, length = 50)
    private String rewardType;

    @Column(name = "DESCRIPTION", length = 255)
    private String description;

    @Column(name = "IS_ACTIVE", nullable = false, length = 1, columnDefinition = "CHAR(1)")
    private String isActive;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.isActive == null) {
            this.isActive = "Y";
        }
    }
}