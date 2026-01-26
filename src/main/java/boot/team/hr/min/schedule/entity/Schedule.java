package boot.team.hr.min.schedule.entity;

import boot.team.hr.hyun.emp.entity.Emp;
import boot.team.hr.min.schedule.dto.ScheduleDto;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;


@Entity
@Table(name="SCHEDULE")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Schedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="emp_id", nullable=false)
    private Emp emp;

    @Column(length=50)
    private String title;

    @Column(name="start_at")
    private LocalDateTime startAt;

    @Column(name="end_at")
    private LocalDateTime endAt;

    @Column(length=200)
    private String description;

    public static Schedule from(ScheduleDto dto,Emp emp){
        return Schedule.builder()
                .id(dto.getId())
                .emp(emp)
                .title(dto.getTitle())
                .startAt(dto.getStartAt())
                .endAt(dto.getEndAt())
                .description(dto.getDescription())
                .build();
    }
    public void update(Emp emp, String title, LocalDateTime startAt, LocalDateTime endAt, String description){
        this.emp = emp;
        this.title = title;
        this.startAt = startAt;
        this.endAt = endAt;
        this.description = description;
    }
}
