package boot.team.hr.min.invite.dto;

import boot.team.hr.min.invite.entity.Invite;
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

    public static InviteDto from(Invite invite){
        InviteDto dto=new InviteDto();
        dto.id=invite.getId();
        dto.empId=invite.getEmp().getEmpId();
        dto.email=invite.getEmail();
        dto.status=invite.getStatus();
        dto.createdAt=invite.getCreatedAt();
        dto.completedAt=invite.getCompletedAt();
        return dto;
    }
}
