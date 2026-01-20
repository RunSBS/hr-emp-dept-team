package boot.team.hr.hyun.outsourcing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// DTO
@Getter @Builder @AllArgsConstructor @NoArgsConstructor
public class OutsourcingAssignmentHistoryDto {
    private Long assignHistoryId;
    private Long assignmentId;
    private String fieldName;
    private String beforeValue;
    private String afterValue;
    private String changerName;
    private LocalDateTime createdAt;
}