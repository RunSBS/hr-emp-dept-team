package boot.team.hr.gyu.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "EVALUATION_RESULT")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluationResult {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "eval_result_seq")
    @SequenceGenerator(
            name = "eval_result_seq",
            sequenceName = "EVALUATION_RESULT_SEQ",
            allocationSize = 1
    )
    @Column(name = "EVALUATION_ID")
    private Long evaluationId;

    @Column(name = "EMP_ID", nullable = false)
    private String empId;

    @Column(name = "EVALUATOR_ID", nullable = false)
    private String evaluatorId;

    @Column(name = "TOTAL_SCORE")
    private Integer totalScore;

    @Column(name = "EVALUATION_PERIOD", nullable = false, length = 30)
    private String evaluationPeriod;

    @Column(name = "EVALUATION_COMMENT", length = 255)
    private String comment;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}