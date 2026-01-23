package boot.team.hr.hyun.emp.entity;

import boot.team.hr.hyun.common.BaseTimeEntity;
import boot.team.hr.hyun.dept.entity.Dept;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@NoArgsConstructor
@Getter
@Builder
@Setter
@AllArgsConstructor
public class Emp extends BaseTimeEntity {
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