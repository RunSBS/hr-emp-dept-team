package boot.team.hr.eun.attendance.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "ATTENDANCE_POLICY")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class AttendancePolicy {

    @Id
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "attendance_policy_seq"
    )
    @SequenceGenerator(
            name = "attendance_policy_seq",
            sequenceName = "ATTENDANCE_POLICY_SEQ",
            allocationSize = 1
    )
    private Long policyId;

    private Integer startTime;
    private Integer lateTime;
    private Integer overtimeStart;

    private String description;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;

    private String updatedBy;
    private LocalDate updatedAt;

    /* ===================== 생성 팩토리 ===================== */
    public static AttendancePolicy create(
            Integer startTime,
            Integer lateTime,
            Integer overtimeStart,
            String description,
            LocalDate effectiveFrom,
            LocalDate effectiveTo,
            String adminId
    ) {
        AttendancePolicy policy = new AttendancePolicy();
        policy.apply(
                startTime,
                lateTime,
                overtimeStart,
                description,
                effectiveFrom,
                effectiveTo,
                adminId
        );
        return policy;
    }

    /* ===================== 상태 변경 ===================== */
    public void change(
            Integer startTime,
            Integer lateTime,
            Integer overtimeStart,
            String description,
            LocalDate effectiveFrom,
            LocalDate effectiveTo,
            String adminId
    ) {
        apply(
                startTime,
                lateTime,
                overtimeStart,
                description,
                effectiveFrom,
                effectiveTo,
                adminId
        );
    }

    private void apply(
            Integer startTime,
            Integer lateTime,
            Integer overtimeStart,
            String description,
            LocalDate effectiveFrom,
            LocalDate effectiveTo,
            String adminId
    ) {
        this.startTime = startTime;
        this.lateTime = lateTime;
        this.overtimeStart = overtimeStart;
        this.description = description;
        this.effectiveFrom = effectiveFrom;
        this.effectiveTo = effectiveTo;
        this.updatedBy = adminId;
        this.updatedAt = LocalDate.now();
    }

    /* ===================== LocalTime 변환 ===================== */
    public LocalTime getStartLocalTime() {
        return toLocalTime(startTime);
    }

    public LocalTime getLateLocalTime() {
        return toLocalTime(lateTime);
    }

    public LocalTime getOvertimeStartLocalTime() {
        return toLocalTime(overtimeStart);
    }

    private LocalTime toLocalTime(int hhmm) {
        return LocalTime.of(hhmm / 100, hhmm % 100);
    }
}
