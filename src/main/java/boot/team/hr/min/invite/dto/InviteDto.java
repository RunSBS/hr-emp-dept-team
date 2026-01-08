package boot.team.hr.min.invite.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class InviteDto {
    private Long id;
    private String empId;
    private String email;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}
