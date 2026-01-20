package boot.team.hr.min.project.entitiy;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Table(name="PHASE_DELIVER")
@Entity
@Getter
@Setter
@NoArgsConstructor
public class PhaseDeliver {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="phase_id")
    private ProjectPhase projectPhase;

    @Column(length=50)
    private String name;

    @Column(length=200)
    private String description;

    @Column(length=50)
    private String file_path;

    private LocalDateTime created_at;

    private LocalDateTime updated_at;

    @Column(length=20)
    private String status;

    public PhaseDeliver(ProjectPhase projectPhase, String name, String description, String file_path, LocalDateTime created_at, LocalDateTime updated_at, String status) {
        this.projectPhase = projectPhase;
        this.name = name;
        this.description = description;
        this.file_path = file_path;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.status = status;
    }
    public void update(ProjectPhase projectPhase, String name, String description, String file_path, LocalDateTime created_at, LocalDateTime updated_at, String status){
        this.projectPhase = projectPhase;
        this.name = name;
        this.description = description;
        this.file_path = file_path;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.status = status;
    }
}
