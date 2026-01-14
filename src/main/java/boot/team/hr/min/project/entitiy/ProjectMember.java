package boot.team.hr.min.project.entitiy;

import boot.team.hr.hyun.emp.entity.Emp;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name="PROJECT_MEMBER",
        uniqueConstraints = {
            @UniqueConstraint(
            name = "UK_PROJECT_MEMBER_PROJECT_EMP",
            columnNames = {"project_id", "emp_id"}
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
public class ProjectMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="project_id",nullable=false)
    private Project project;


    @ManyToOne(fetch= FetchType.LAZY)
    @JoinColumn(name="emp_id",nullable=false)
    private Emp emp;

    private String role;

    public ProjectMember(Project project, Emp emp, String role) {
        this.project = project;
        this.emp = emp;
        this.role = role;
    }
    public void changeRole(String role) {
        this.role = role;
    }
}
