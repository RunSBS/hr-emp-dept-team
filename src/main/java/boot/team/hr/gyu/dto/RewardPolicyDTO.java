package boot.team.hr.gyu.dto;

import boot.team.hr.gyu.entity.RewardPolicy;
import java.time.LocalDateTime;

public class RewardPolicyDTO {

    private Long policyId;
    private String policyName;
    private String rewardType;
    private Long rewardAmount;
    private String description;
    private Boolean isActive;
    private LocalDateTime createdAt;

    // Constructors
    public RewardPolicyDTO() {}

    public RewardPolicyDTO(Long policyId, String policyName, String rewardType, Long rewardAmount,
                           String description, Boolean isActive, LocalDateTime createdAt) {
        this.policyId = policyId;
        this.policyName = policyName;
        this.rewardType = rewardType;
        this.rewardAmount = rewardAmount;
        this.description = description;
        this.isActive = isActive;
        this.createdAt = createdAt;
    }

    // Entity to DTO converter
    public static RewardPolicyDTO fromEntity(RewardPolicy entity) {
        return new RewardPolicyDTO(
            entity.getPolicyId(),
            entity.getPolicyName(),
            entity.getRewardType(),
            entity.getRewardAmount(),
            entity.getDescription(),
            entity.getIsActive(),
            entity.getCreatedAt()
        );
    }

    // DTO to Entity converter
    public RewardPolicy toEntity() {
        RewardPolicy entity = new RewardPolicy();
        entity.setPolicyId(this.policyId);
        entity.setPolicyName(this.policyName);
        entity.setRewardType(this.rewardType);
        entity.setRewardAmount(this.rewardAmount);
        entity.setDescription(this.description);
        entity.setIsActive(this.isActive);
        entity.setCreatedAt(this.createdAt);
        return entity;
    }

    // Getters and Setters
    public Long getPolicyId() {
        return policyId;
    }

    public void setPolicyId(Long policyId) {
        this.policyId = policyId;
    }

    public String getPolicyName() {
        return policyName;
    }

    public void setPolicyName(String policyName) {
        this.policyName = policyName;
    }

    public String getRewardType() {
        return rewardType;
    }

    public void setRewardType(String rewardType) {
        this.rewardType = rewardType;
    }

    public Long getRewardAmount() {
        return rewardAmount;
    }

    public void setRewardAmount(Long rewardAmount) {
        this.rewardAmount = rewardAmount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}