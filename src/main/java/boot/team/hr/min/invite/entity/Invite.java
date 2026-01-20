package boot.team.hr.min.invite.entity;

import boot.team.hr.hyun.emp.entity.Emp;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "INVITE",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "email")
        }
)
@NoArgsConstructor
@Getter
@Setter
public class Invite {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emp_id", nullable = false)
    private Emp emp;

    @Column(nullable = false, length = 255, unique = true)
    private String email;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name="created_at",nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // 초대 생성
    public Invite(Emp emp, String email) {
        this.emp = emp;
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
