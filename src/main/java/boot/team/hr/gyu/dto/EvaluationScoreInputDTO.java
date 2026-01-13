package boot.team.hr.gyu.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluationScoreInputDTO {
    private Long criteriaId;
    private Integer score;
}