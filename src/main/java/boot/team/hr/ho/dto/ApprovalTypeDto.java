package boot.team.hr.ho.dto;

import lombok.*;

@Data
@AllArgsConstructor
public class ApprovalTypeDto {
    private Long typeId;
    private String typeName;
    private String description;
}
