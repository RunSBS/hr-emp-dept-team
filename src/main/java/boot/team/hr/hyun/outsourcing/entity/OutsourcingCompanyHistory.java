package boot.team.hr.hyun.outsourcing.entity;

import boot.team.hr.hyun.emp.entity.Emp;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// Entity
@Entity
@Table(name = "outsourcing_company_history")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OutsourcingCompanyHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "company_history_seq")
    @SequenceGenerator(name = "company_history_seq", sequenceName = "seq_company_history", allocationSize = 1)
    private Long companyHistoryId;

    private Long companyId;
    private String fieldName;
    private String beforeValue;
    private String afterValue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changer_id")
    private Emp changer; // 변경을 수행한 사원

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() { this.createdAt = LocalDateTime.now(); }
}