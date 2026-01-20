package boot.team.hr.eun.attendance.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ATTENDANCE_POLICY")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class AttendancePolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "attendance_policy_seq")
    @SequenceGenerator(
            name = "attendance_policy_seq",
            sequenceName = "ATTENDANCE_POLICY_SEQ",
            allocationSize = 1
    )
    @Column(name = "POLICY_ID")
    private Long policyId;

    @Column(name = "START_TIME")
    private Integer startTime;      // 900

    @Column(name = "LATE_TIME")
    private Integer lateTime;       // 910

    @Column(name = "OVERTIME_START")
    private Integer overtimeStart;  // 1800

    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "EFFECTIVE_FROM")
    private LocalDate effectiveFrom;

    @Column(name = "EFFECTIVE_TO")
    private LocalDate effectiveTo;

    @Column(name = "UPDATED_BY")
    private Long updatedBy;

    @Column(name = "UPDATE_AT")
    private LocalDateTime updateAt;

    /* ===================== 정책 생성 ===================== */
    public static AttendancePolicy create(
            Integer startTime,
            Integer lateTime,
            Integer overtimeStart,
            String description,
            LocalDate effectiveFrom,
            LocalDate effectiveTo,
            Long adminId
    ) {
        AttendancePolicy policy = new AttendancePolicy();
        policy.updatePolicy(
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

    /* ===================== 정책 변경 ===================== */
    public void updatePolicy(
            Integer startTime,
            Integer lateTime,
            Integer overtimeStart,
            String description,
            LocalDate effectiveFrom,
            LocalDate effectiveTo,
            Long updatedBy
    ) {
        validateTime(startTime, lateTime, overtimeStart);
        validatePeriod(effectiveFrom, effectiveTo);

        this.startTime = startTime;
        this.lateTime = lateTime;
        this.overtimeStart = overtimeStart;
        this.description = description;
        this.effectiveFrom = effectiveFrom;
        this.effectiveTo = effectiveTo;
        this.updatedBy = updatedBy;
        this.updateAt = LocalDateTime.now();
    }

    /* ===================== 시간 유효성 검증 ===================== */
    private void validateTime(
            Integer startTime,
            Integer lateTime,
            Integer overtimeStart
    ) {
        validateHHmm(startTime);
        validateHHmm(lateTime);
        validateHHmm(overtimeStart);

        if (lateTime < startTime) {
            throw new IllegalArgumentException("지각 기준 시간은 출근 시작 시간 이후여야 합니다.");
        }

        if (overtimeStart < startTime) {
            throw new IllegalArgumentException("야근 시작 시간은 출근 시간 이후여야 합니다.");
        }
    }

    /* ===================== 기간 유효성 검증 ===================== */
    private void validatePeriod(
            LocalDate from,
            LocalDate to
    ) {
        if (from.isAfter(to)) {
            throw new IllegalArgumentException("정책 시작일은 종료일보다 이후일 수 없습니다.");
        }
    }

    /* ===================== HHmm 형식 검증 ===================== */
    private void validateHHmm(Integer time) {
        if (time == null) {
            throw new IllegalArgumentException("시간 값은 필수입니다.");
        }

        int hour = time / 100;
        int minute = time % 100;

        if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
            throw new IllegalArgumentException("시간 형식이 올바르지 않습니다. (HHmm)");
        }
    }
}
