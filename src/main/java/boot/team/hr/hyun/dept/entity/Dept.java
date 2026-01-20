package boot.team.hr.hyun.dept.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Dept {
    @Id
    @Column(name = "dept_no")
    private Integer deptNo;     // 부서 번호

    private String deptName;    // 부서명
    private String deptLoc;     // 부서 위치

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_dept_no")
    private Dept parent;    // 상위 부서 객체
    private Integer treeLevel;      //조직도용 트리 계층(depth)
    private Integer siblingOrder;   //같은 부모(형제) 내 정렬 순서

    private LocalDateTime createdAt;    //생성일자
    private LocalDateTime updatedAt;    //수정일자

    public void update(String deptName, String deptLoc, Dept parent, Integer treeLevel, Integer siblingOrder) {
        this.deptName = deptName;
        this.deptLoc = deptLoc;
        this.parent = parent;
        this.treeLevel = treeLevel;
        this.siblingOrder = siblingOrder;
    }

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
