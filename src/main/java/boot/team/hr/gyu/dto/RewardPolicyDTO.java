package boot.team.hr.gyu.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RewardPolicyDTO {

    private Long policyId;
    private String policyName;
    private String rewardType;
    private String description;
    private String isActive;
    private LocalDateTime createdAt;
}