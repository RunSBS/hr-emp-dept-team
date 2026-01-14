package boot.team.hr.min.project.dto;

import boot.team.hr.min.project.entitiy.PhaseDeliver;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PhaseDeliverDto {
    private Long id;
    private Long phaseId;
    private String name;
    private String description;
    private String filePath;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String status;

    public static PhaseDeliverDto from(PhaseDeliver phaseDeliver) {
        PhaseDeliverDto dto = new PhaseDeliverDto();
        dto.id = phaseDeliver.getId();
        dto.phaseId = phaseDeliver.getProjectPhase().getId();
        dto.name = phaseDeliver.getName();
        dto.description = phaseDeliver.getDescription();
        dto.filePath = phaseDeliver.getFile_path();
        dto.createdAt = phaseDeliver.getCreated_at();
        dto.updatedAt = phaseDeliver.getUpdated_at();
        dto.status = phaseDeliver.getStatus();
        return dto;
    }
}
