package boot.team.hr.gyu.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluationScoreDTO {

    private Long detailId;
    private Long evaluationId;
    private Long criteriaId;
    private String criteriaName;
    private Integer weight;
    private Integer score;
    private Integer weightedScore;  // 가중치 적용 점수
}