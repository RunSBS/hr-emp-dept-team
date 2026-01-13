package boot.team.hr.gyu.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluationTargetDTO {
    private Long id;
    private String empId;
    private String empName;
    private Integer deptId;
    private String empRole;
}