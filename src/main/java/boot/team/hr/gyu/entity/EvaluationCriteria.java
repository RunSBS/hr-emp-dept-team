package boot.team.hr.gyu.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "EVALUATION_CRITERIA")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluationCriteria {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "criteria_seq")
    @SequenceGenerator(
            name = "criteria_seq",
            sequenceName = "EVALUATION_CRITERIA_SEQ",
            allocationSize = 1
    )
    @Column(name = "CRITERIA_ID")
    private Long criteriaId;

    @Column(name = "CRITERIA_NAME", nullable = false, length = 50)
    private String criteriaName;

    @Column(name = "WEIGHT", nullable = false, precision = 3)
    private Integer weight;

    @Column(name = "DESCRIPTION", length = 255)
    private String description;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}