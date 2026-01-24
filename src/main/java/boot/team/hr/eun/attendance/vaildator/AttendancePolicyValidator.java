package boot.team.hr.eun.attendance.vaildator;

import boot.team.hr.eun.attendance.entity.AttendancePolicy;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class AttendancePolicyValidator {

    public void validateTime(AttendancePolicy policy) {
        validateHHmm(policy.getStartTime());
        validateHHmm(policy.getLateTime());
        validateHHmm(policy.getOvertimeStart());

        if (policy.getLateTime() < policy.getStartTime()) {
            throw new IllegalArgumentException("지각 기준 시간은 출근 시작 시간 이후여야 합니다.");
        }
        if (policy.getOvertimeStart() < policy.getStartTime()) {
            throw new IllegalArgumentException("야근 시작 시간은 출근 시간 이후여야 합니다.");
        }
    }

    public void validatePeriod(LocalDate from, LocalDate to) {
        if (from.isAfter(to)) {
            throw new IllegalArgumentException("정책 시작일은 종료일보다 이후일 수 없습니다.");
        }
    }

    private void validateHHmm(Integer time) {
        if (time == null) throw new IllegalArgumentException("시간 값은 필수입니다.");
        int hour = time / 100;
        int minute = time % 100;
        if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
            throw new IllegalArgumentException("시간 형식이 올바르지 않습니다. (HHmm)");
        }
    }
}

