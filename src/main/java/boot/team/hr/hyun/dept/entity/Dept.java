package boot.team.hr.hyun.dept.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class Dept {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Integer deptId;
    private String deptName;
    private String deptLoc;
    private Integer parentDeptId;
    private Integer floor;
    private Integer orderNo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
