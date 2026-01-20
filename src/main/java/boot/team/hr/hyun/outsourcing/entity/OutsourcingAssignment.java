package boot.team.hr.hyun.outsourcing.entity;

import boot.team.hr.hyun.emp.entity.Emp;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "outsourcing_assignment")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OutsourcingAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "outsourcing_assignment_seq")
    @SequenceGenerator(
            name = "outsourcing_assignment_seq",
            sequenceName = "seq_outsourcing_assignment",
            allocationSize = 1
    )
    @Column(name = "assignment_id")
    private Long assignmentId;      // 배치 식별자

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emp_id", nullable = false)
    private Emp emp;                // 사원 외래키

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private OutsourcingCompany company;     // 파견 업체 외래키

    @Column(name = "project_name", length = 100)
    private String projectName;         // 프로젝트 명으로 같은 업체와 2개 이상의 계약을 할 시 프로젝트명으로 구분

    @Column(name = "status", length = 30)
    private String status; // 예정 / 진행중 / 종료 -> 오늘이 파견일보다 크고, 철수일보다 작으면 진행중 / 파견일보다 작으면 예정 / 철수일보다 크면 종료

    @Column(name = "start_date")
    private LocalDate startDate;    // 파견일

    @Column(name = "end_date")
    private LocalDate endDate;      // 철수일

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;    // 행 생성일

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;    // 행 수정일

    public void update(Emp emp, OutsourcingCompany company, String projectName, String status, LocalDate startDate, LocalDate endDate) {
        this.emp = emp;
        this.company = company;
        this.projectName = projectName;
        this.status = status;
        this.startDate = startDate;
        this.endDate = endDate;
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