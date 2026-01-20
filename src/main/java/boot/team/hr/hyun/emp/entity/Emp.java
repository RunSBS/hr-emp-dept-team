package boot.team.hr.hyun.emp.entity;

import boot.team.hr.hyun.dept.entity.Dept;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@NoArgsConstructor
@Getter
@Builder
@Setter
@AllArgsConstructor
public class Emp {
    @Id
    @Column(name = "emp_id")
    private String empId;

    @Column(name = "emp_name")
    private String empName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "emp_role")
    private String empRole;

    @Column(name = "hire_date") // 추가: 입사일
    private LocalDate hireDate;

    private String managerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "dept_no",
            referencedColumnName = "dept_no"
    )
    private Dept dept;

    // updatable = false를 설정하여 실수로 생성일이 수정되는 것을 방지합니다.
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // --- JPA Lifecycle Events ---

    @PrePersist
    public void prePersist() {
        // 엔티티가 처음 저장(INSERT)될 때 실행
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        // 엔티티가 수정(UPDATE)될 때 실행
        this.updatedAt = LocalDateTime.now();
    }

    // --- 비즈니스 메서드 ---
    public void update(String empName, String email, String empRole, LocalDate hireDate, Dept dept) {
        this.empName = empName;
        this.email = email;
        this.empRole = empRole;
        this.hireDate = hireDate;
        this.dept = dept;
        // 여기서 직접 updatedAt을 세팅하지 않아도 @PreUpdate가 처리합니다.
    }
}