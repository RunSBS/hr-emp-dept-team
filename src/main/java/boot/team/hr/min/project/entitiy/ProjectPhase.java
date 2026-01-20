package boot.team.hr.min.project.entitiy;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Table(name="PROJECT_PHASE")
@Entity
@Getter
@Setter
@NoArgsConstructor
public class ProjectPhase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="project_id")
    private Project project;

    @Column(length=50)
    private String name;

    @Column(length=200)
    private String description;

    @Column(length=50)
    private Integer sequence;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    @Column(length=50)
    private String status;

    public ProjectPhase(Project project, String name, String description,Integer sequence, LocalDateTime startDate, LocalDateTime endDate,String status) {
        this.project = project;
        this.name = name;
        this.description = description;
        this.sequence = sequence;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
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
