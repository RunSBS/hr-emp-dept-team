package boot.team.hr.min.project.entitiy;

import boot.team.hr.min.project.dto.ProjectPhaseDto;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Table(name="PROJECT_PHASE")
@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectPhase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="project_id")
    private Project project;

    @Column(length=50)
    private String name;

    @Column(length=1000)
    private String description;

    @Column(length=50)
    private Integer sequence;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    @Column(length=50)
    private String status;

    public static ProjectPhase from(ProjectPhaseDto dto,Project project) {
        return ProjectPhase.builder()
                .id(dto.getId())
                .project(project)
                .name(dto.getName())
                .description(dto.getDescription())
                .sequence(dto.getSequence())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .status(dto.getStatus())
                .build();
    }
    public void update(Project project, String name, String description,Integer sequence, LocalDateTime startDate, LocalDateTime endDate,String status){
        this.name = name;
        this.description = description;
        this.sequence = sequence;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
    }
}
