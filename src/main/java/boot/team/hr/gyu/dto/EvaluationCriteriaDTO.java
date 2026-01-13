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
public class EvaluationCriteriaDTO {

    private Long criteriaId;
    private String criteriaName;
    private Integer weight;
    private String description;
    private LocalDateTime createdAt;
}