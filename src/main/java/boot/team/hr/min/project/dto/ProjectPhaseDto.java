package boot.team.hr.min.project.dto;

import boot.team.hr.min.project.entitiy.ProjectPhase;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ProjectPhaseDto {
    private Long id;
    private Long projectId;
    private String name;
    private String description;
    private Integer sequence;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String status;

    public static ProjectPhaseDto from(ProjectPhase projectPhase) {
        ProjectPhaseDto projectPhaseDto = new ProjectPhaseDto();
        projectPhaseDto.id=projectPhase.getId();
        projectPhaseDto.projectId=projectPhase.getProject().getId();
        projectPhaseDto.name=projectPhase.getName();
        projectPhaseDto.description=projectPhase.getDescription();
        projectPhaseDto.sequence=projectPhase.getSequence();
        projectPhaseDto.startDate=projectPhase.getStartDate();
        projectPhaseDto.endDate=projectPhase.getEndDate();
        projectPhaseDto.status=projectPhase.getStatus();
        return  projectPhaseDto;
    }
}
