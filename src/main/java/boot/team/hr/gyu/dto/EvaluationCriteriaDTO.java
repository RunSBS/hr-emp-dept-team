package boot.team.hr.gyu.dto;

import boot.team.hr.gyu.entity.EvaluationCriteria;
import java.time.LocalDateTime;

public class EvaluationCriteriaDTO {

    private Long criteriaId;
    private String criteriaName;
    private Integer weight;
    private String description;
    private LocalDateTime createdAt;

    // Constructors
    public EvaluationCriteriaDTO() {}

    public EvaluationCriteriaDTO(Long criteriaId, String criteriaName, Integer weight, String description, LocalDateTime createdAt) {
        this.criteriaId = criteriaId;
        this.criteriaName = criteriaName;
        this.weight = weight;
        this.description = description;
        this.createdAt = createdAt;
    }

    // Entity to DTO converter
    public static EvaluationCriteriaDTO fromEntity(EvaluationCriteria entity) {
        return new EvaluationCriteriaDTO(
            entity.getCriteriaId(),
            entity.getCriteriaName(),
            entity.getWeight(),
            entity.getDescription(),
            entity.getCreatedAt()
        );
    }

    // DTO to Entity converter
    public EvaluationCriteria toEntity() {
        EvaluationCriteria entity = new EvaluationCriteria();
        entity.setCriteriaId(this.criteriaId);
        entity.setCriteriaName(this.criteriaName);
        entity.setWeight(this.weight);
        entity.setDescription(this.description);
        entity.setCreatedAt(this.createdAt);
        return entity;
    }

    // Getters and Setters
    public Long getCriteriaId() {
        return criteriaId;
    }

    public void setCriteriaId(Long criteriaId) {
        this.criteriaId = criteriaId;
    }

    public String getCriteriaName() {
        return criteriaName;
    }

    public void setCriteriaName(String criteriaName) {
        this.criteriaName = criteriaName;
    }

    public Integer getWeight() {
        return weight;
    }

    public void setWeight(Integer weight) {
        this.weight = weight;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}