package boot.team.hr.min.project.entitiy;

import boot.team.hr.min.project.dto.PhaseDeliverDto;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "PHASE_DELIVER")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhaseDeliver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phase_id", nullable = false)
    private ProjectPhase projectPhase;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 200)
    private String description;

    @Column(name="file_path",length = 255)
    private String filePath;

    @Column(name="created_at",nullable = false)

    private LocalDateTime createdAt;

    @Column(name="updated_at")
    private LocalDateTime updatedAt;

    @Column(nullable = false, length = 20)
    private String status;

    /* ===== 생성 ===== */
    public static PhaseDeliver from(PhaseDeliverDto dto, ProjectPhase phase) {
        return PhaseDeliver.builder()
                .projectPhase(phase)
                .name(dto.getName())
                .description(dto.getDescription())
                .filePath(dto.getFilePath())
                .status(dto.getStatus())
                .build();
    }

    /* ===== 수정 ===== */
    public void update(PhaseDeliverDto dto, ProjectPhase phase) {
        this.projectPhase = phase;
        this.name = dto.getName();
        this.description = dto.getDescription();
        this.filePath = dto.getFilePath();
        this.status = dto.getStatus();
    }

    /* ===== 시간 자동 ===== */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "CREATED";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
