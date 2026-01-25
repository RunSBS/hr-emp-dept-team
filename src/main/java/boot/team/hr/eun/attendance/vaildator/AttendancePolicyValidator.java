package boot.team.hr.eun.attendance.vaildator;

import boot.team.hr.eun.attendance.entity.AttendancePolicy;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;

@Component
public class AttendancePolicyValidator {

    public void validateTime(AttendancePolicy policy) {
        validateHHmm(policy.getStartTime());
        validateHHmm(policy.getLateTime());
        validateHHmm(policy.getOvertimeStart());

        // ✅ 휴게시간도 HHmm 검증
        validateHHmm(policy.getBreakStart());
        validateHHmm(policy.getBreakEnd());

        if (policy.getLateTime() < policy.getStartTime()) {
            throw new IllegalArgumentException("지각 기준 시간은 출근 시작 시간 이후여야 합니다.");
        }
        if (policy.getOvertimeStart() < policy.getStartTime()) {
            throw new IllegalArgumentException("야근 시작 시간은 출근 시간 이후여야 합니다.");
        }

        // ✅ (선택) breakStart/breakEnd가 start~overtime 범위 안인지
        validateBreakInRange(policy);

        // ✅ (선택) 휴게시간이 최소 60분 이상인지
        validateBreakMinimumMinutes(policy, 60);
    }

    private void validateBreakInRange(AttendancePolicy policy) {
        Integer start = policy.getStartTime();
        Integer overtime = policy.getOvertimeStart();
        Integer breakStart = policy.getBreakStart();
        Integer breakEnd = policy.getBreakEnd();

        if (breakStart >= breakEnd) {
            throw new IllegalArgumentException("휴게 시작 시간은 휴게 종료 시간보다 이전이어야 합니다.");
        }

        // start <= breakStart < breakEnd <= overtime
        if (breakStart < start || breakEnd > overtime) {
            throw new IllegalArgumentException("휴게시간은 출근시간~야근시작시간 범위 내에 있어야 합니다.");
        }
    }

    private void validateBreakMinimumMinutes(AttendancePolicy policy, int minMinutes) {
        LocalTime bs = policy.getBreakStartLocalTime();
        LocalTime be = policy.getBreakEndLocalTime();

        long minutes = Duration.between(bs, be).toMinutes();
        if (minutes < minMinutes) {
            throw new IllegalArgumentException("휴게시간은 최소 " + minMinutes + "분 이상이어야 합니다.");
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
