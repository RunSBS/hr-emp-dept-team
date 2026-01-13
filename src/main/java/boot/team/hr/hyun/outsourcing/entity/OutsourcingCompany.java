package boot.team.hr.hyun.outsourcing.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "outsourcing_company")
@Getter
@Setter
@NoArgsConstructor
public class OutsourcingCompany {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "outsourcing_company_seq")
    @SequenceGenerator(
            name = "outsourcing_company_seq",
            sequenceName = "seq_outsourcing_company",
            allocationSize = 1
    )
    @Column(name = "company_id")
    private Long companyId;     // 업체식별자

    @Column(name = "company_name", nullable = false, length = 100)
    private String companyName;     // 업체명

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}