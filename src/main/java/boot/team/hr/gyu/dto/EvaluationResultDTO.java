package boot.team.hr.gyu.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluationResultDTO {

    private Long evaluationId;
    private String empId;
    private String empName;
    private String evaluatorId;
    private String evaluatorName;
    private Integer totalScore;
    private String evaluationPeriod;
    private String comment;
    private LocalDateTime createdAt;

    // 평가 항목별 점수 리스트
    private List<EvaluationScoreDTO> scores;

    // 등급 계산 (S, A, B, C)
    private String grade;
}