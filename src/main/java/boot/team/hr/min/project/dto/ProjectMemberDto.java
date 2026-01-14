package boot.team.hr.min.project.dto;

import boot.team.hr.min.project.entitiy.ProjectMember;
import lombok.Data;

@Data
public class ProjectMemberDto {
    private Long id;          // ProjectMember PK
    private Long projectId;
    private String role;

    // 사원 정보
    private String empId;
    private String empName;
    private String empEmail;

    public static ProjectMemberDto from(ProjectMember pm) {
        ProjectMemberDto dto = new ProjectMemberDto();
        dto.id = pm.getId();
        dto.projectId = pm.getProject().getId();
        dto.role = pm.getRole();

        // 사원 정보 포함
        dto.empId = pm.getEmp().getEmpId();
        dto.empName = pm.getEmp().getEmpName();       // Emp 엔티티에 name 필드 있어야 함
        dto.empEmail = pm.getEmp().getEmail();

        return dto;
    }
}
