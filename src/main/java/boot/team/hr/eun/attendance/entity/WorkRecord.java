package boot.team.hr.eun.attendance.entity;

import boot.team.hr.eun.attendance.enums.WorkStatus;
import boot.team.hr.eun.attendance.enums.WorkType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "WORK_RECORD",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"EMP_ID", "WORK_DATE"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "work_record_seq")
    @SequenceGenerator(name = "work_record_seq", sequenceName = "WORK_RECORD_SEQ", allocationSize = 1)
    private Long workId;

    @Column(name = "EMP_ID")
    private String employeeId;
    private LocalDate workDate;

    private LocalDateTime checkIn;
    private LocalDateTime checkOut;

    private Integer normalWorkMinutes;
    private Integer overtimeWorkMinutes;
    private Integer unpaidMinutes;
    private Integer totalWorkMinutes;

    @Enumerated(EnumType.STRING)
    @Column(name = "WORK_STATUS")
    private WorkStatus workStatus;


    @Enumerated(EnumType.STRING)
    @Column(name = "WORK_TYPE")
    private WorkType workType;

}
