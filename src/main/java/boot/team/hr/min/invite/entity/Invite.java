package boot.team.hr.min.invite.entity;

import boot.team.hr.hyun.emp.entity.Emp;
import boot.team.hr.min.invite.dto.InviteDto;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "INVITE",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "email")
        }
)
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
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

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "PENDING";
        }
    }

    public static Invite from(Emp emp, InviteDto dto){
        return Invite.builder()
                .emp(emp)
                .email(dto.getEmail())
                .build();
    }

    // 초대 수락
    public void update() {
        this.status = "COMPLETED";
        this.completedAt = LocalDateTime.now();
    }
}
