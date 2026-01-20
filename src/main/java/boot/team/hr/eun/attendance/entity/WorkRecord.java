package boot.team.hr.eun.attendance.entity;

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

    private String workStatus; // NORMAL, LATE, EARLY_LEAVE, ABSENT, LEAVE
    private String workType;   // OFFICE, OUTSIDE, REMOTE(IS_ACTIVE == 'N'), NIGHT, LEAVE, OFF

}
