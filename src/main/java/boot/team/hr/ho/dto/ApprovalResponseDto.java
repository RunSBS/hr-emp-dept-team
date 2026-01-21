package boot.team.hr.ho.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@ToString
public class ApprovalResponseDto {
    private Long approvalId;
    private String empId;
    private Long typeId;
    private String typeName;
    private String typeDescription;
    private String title;
    private String content;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<LineDto> lines;
    private List<FileDto> files;
    private List<LogDto> logs;
}


