package boot.team.hr.hyun.emp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EmpHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "emp_history_id")
    private Long empHistoryId;

    @Column(name = "emp_id", nullable = false)
    private String empId; // 수정된 사원

    @Column(name = "change_type")
    private String changeType;
    @Column(name = "field_name")
    private String fieldName;
    @Column(name = "before_value")
    private String beforeValue;
    @Column(name = "after_value")
    private String afterValue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changer_id", referencedColumnName = "emp_id")
    private Emp changer; // 관리자(이 사원을 변경한 사람)

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
