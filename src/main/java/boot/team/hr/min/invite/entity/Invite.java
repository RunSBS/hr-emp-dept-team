package boot.team.hr.min.invite.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@NoArgsConstructor
@Getter
@Setter
public class Invite {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name="emp_id")
    private String empId;
    private String email;
    private String status;
    @Column(name="created_at")
    private LocalDateTime createdAt;
    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // 초대 생성
    public Invite(String empId, String email) {
        this.empId = empId;
        this.email = email;
        this.status = "PENDING";
        this.createdAt = LocalDateTime.now();
    }

    // 초대 수락
    public void complete() {
        this.status = "COMPLETED";
        this.completedAt = LocalDateTime.now();
    }
}
