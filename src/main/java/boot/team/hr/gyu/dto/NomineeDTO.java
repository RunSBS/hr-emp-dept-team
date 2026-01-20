package boot.team.hr.gyu.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NomineeDTO {
    private String empId;
    private String empName;
    private String empRole;
    private Integer deptNo;
    private String deptName;
}