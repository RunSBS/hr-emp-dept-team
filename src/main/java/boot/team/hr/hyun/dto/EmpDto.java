package boot.team.hr.hyun.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class EmpDto {
    private String empId;   // React의 empId와 매핑
    private String empName; // React의 empName과 매핑
    private String deptId;  // React의 deptId와 매핑
    private String email;
    private String role;
    private String createdAt;
    private String updatedAt;
}