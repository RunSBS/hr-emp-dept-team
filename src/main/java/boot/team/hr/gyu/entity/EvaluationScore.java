package boot.team.hr.gyu.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "EVALUATION_SCORE")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluationScore {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "eval_score_seq")
    @SequenceGenerator(
            name = "eval_score_seq",
            sequenceName = "EVALUATION_SCORE_SEQ",
            allocationSize = 1
    )
    @Column(name = "DETAIL_ID")
    private Long detailId;

    @Column(name = "EVALUATION_ID", nullable = false)
    private Long evaluationId;

    @Column(name = "CRITERIA_ID", nullable = false)
    private Long criteriaId;

    @Column(name = "SCORE", nullable = false)
    private Integer score;
}