package boot.team.hr.min.account.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "ACCOUNT",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "email")
        }
)
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account {

    @Id
    @SequenceGenerator(
            name = "acc_seq",
            sequenceName = "ACC_SEQ",
            allocationSize = 1
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "acc_seq"
    )
    private Long id;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, length = 20)
    private String role;   // ADMIN / EMPLOYEE / CEO

    @Column(nullable = false, length = 20)
    private String status; // PENDING / ACTIVE / BLOCKED

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
