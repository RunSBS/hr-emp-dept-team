package boot.team.hr.gyu.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CurrentUserDTO {
    private Long id;
    private String empId;
    private String empName;
    private Integer deptId;
    private String email;
    private String empRole;
}