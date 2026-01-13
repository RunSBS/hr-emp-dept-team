package boot.team.hr.eun.attendance.entity;

import jakarta.persistence.*;
import lombok.Getter;

import java.time.LocalDate;

@Entity
@Table(name = "ATTENDANCE_POLICY")
@Getter
public class AttendancePolicy {

    @Id
    private Long policyId;

    private Integer startTime;       // 900
    private Integer lateTime;        // 910
    private Integer overtimeStart;   // 1800

    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
}
