package boot.team.hr.min.account.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.crypto.password.PasswordEncoder;

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

    @Column(nullable = false, length = 255, unique = true)
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

    public void changePassword(
            String currentPw,
            String newPw,
            PasswordEncoder encoder
    ) {
        if (!encoder.matches(currentPw, this.password)) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }
        this.password = encoder.encode(newPw);
    }
}
