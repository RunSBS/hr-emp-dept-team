package boot.team.hr.min.project.dto;

import boot.team.hr.min.project.entitiy.Project;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class ProjectDto {
    private Long id;
    private String name;
    private String description;
    private String methodology;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String status;
    //jpql용
    public ProjectDto(
            Long id,
            String name,
            String description,
            String methodology,
            LocalDateTime startDate,
            LocalDateTime endDate,
            String status
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.methodology = methodology;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
    }
    
    public static ProjectDto from(Project project) {
        ProjectDto dto=new ProjectDto();
        dto.id=project.getId();
        dto.name=project.getName();
        dto.description=project.getDescription();
        dto.methodology=project.getMethodology();
        dto.startDate=project.getStartDate();
        dto.endDate=project.getEndDate();
        dto.status=project.getStatus();
        return dto;
    }
}
