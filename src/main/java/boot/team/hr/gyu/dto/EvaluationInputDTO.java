package boot.team.hr.gyu.dto;

import lombok.*;

import java.util.List;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluationInputDTO {
    private String empId;            // 평가 대상 직원 사번
    private String evaluatorId;      // 평가자 사번
    private String evaluationPeriod; // 평가 기간
    private String comment;          // 평가 의견

    // 평가 항목별 점수
    private List<EvaluationScoreInputDTO> scores;
}