package boot.team.hr.hyun.emp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@NoArgsConstructor
@Getter
@Setter
public class Emp {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "emp_id") // DB 컬럼명은 emp_id
    private String empId;    // Java 필드명은 empId

    @Column(name = "emp_name")
    private String empName;

    @Column(name = "dept_id")
    private Integer deptId;

    private String email;
    private String role; // CEO, Manager, TeamLeader, Employee ( CEO -> 담당관 -> 팀장 -> 사원)
//    private Integer managerId; // 직속상관 ( 사수 )

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}