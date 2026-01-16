package boot.team.hr.min.schedule.entity;

import boot.team.hr.hyun.emp.entity.Emp;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;


@Entity
@Table(name="SCHEDULE")
@Getter
@Setter
@NoArgsConstructor
public class Schedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="emp_id", nullable=false)
    private Emp emp;

    @Column(length=50)
    private String title;

    private LocalDateTime startAt;

    private LocalDateTime endAt;

    @Column(length=200)
    private String description;

    public Schedule(Emp emp, String title, LocalDateTime startAt, LocalDateTime endAt, String description) {
        this.emp = emp;
        this.title = title;
        this.startAt = startAt;
        this.endAt = endAt;
        this.description = description;
    }
    public void update(Emp emp, String title, LocalDateTime startAt, LocalDateTime endAt, String description){
        this.emp = emp;
        this.title = title;
        this.startAt = startAt;
        this.endAt = endAt;
        this.description = description;
    }
}
