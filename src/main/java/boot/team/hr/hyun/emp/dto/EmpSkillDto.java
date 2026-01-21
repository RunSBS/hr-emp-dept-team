package boot.team.hr.hyun.emp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EmpSkillDto {
    private String empId;
    private String skillName;
    private Integer years;
    private String skillLevel;
}
