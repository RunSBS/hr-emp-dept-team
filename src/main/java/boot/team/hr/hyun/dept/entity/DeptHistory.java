package boot.team.hr.hyun.dept.entity;

import boot.team.hr.hyun.emp.entity.Emp;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class DeptHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long deptHistoryId;

    // 대상 부서: 연관관계 대신 ID만 저장 (부서 삭제 시에도 이력 보존을 위함)
    @Column(name = "dept_no", nullable = false)
    private Integer deptNo;

    @Column(name = "change_type")
    private String changeType; // INSERT, UPDATE, DELETE

    @Column(name = "field_name")
    private String fieldName; // 변경된 컬럼명 (부서명, 위치 등)

    @Column(name = "before_value")
    private String beforeValue;

    @Column(name = "after_value")
    private String afterValue;

    // 변경자: 실제 사원 테이블과 연관관계 형성 (잘못된 사원 ID 입력 방지)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changer_id", referencedColumnName = "emp_id")
    private Emp changer;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}