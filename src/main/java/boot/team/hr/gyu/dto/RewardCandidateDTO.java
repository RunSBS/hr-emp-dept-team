package boot.team.hr.gyu.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RewardCandidateDTO {
    private Long candidateId;
    private Long policyId;
    private String policyName;
    private String nominatorId;
    private String nominatorName;
    private String nomineeId;
    private String nomineeName;
    private String nominationType;
    private String reason;
    private Long rewardAmount;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}