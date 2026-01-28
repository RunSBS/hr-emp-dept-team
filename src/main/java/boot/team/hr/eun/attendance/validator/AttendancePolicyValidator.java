package boot.team.hr.eun.attendance.vaildator;

import boot.team.hr.eun.attendance.entity.AttendancePolicy;

import java.time.Duration;
import java.time.LocalTime;

public final class AttendancePolicyValidator {

    private AttendancePolicyValidator() {}

    public static void validateTime(AttendancePolicy policy) {
        if (policy == null) throw new IllegalArgumentException("근태 정책이 null 입니다.");

        Integer start = policy.getStartTime();
        Integer late = policy.getLateTime();
        Integer overtime = policy.getOvertimeStart();

        validateHhmm(start, "startTime");
        validateHhmm(late, "lateTime");
        validateHhmm(overtime, "overtimeStart");

        LocalTime startT = policy.getStartTimeLocalTime(); // alias 지원
        LocalTime lateT = policy.getLateTimeLocalTime();   // alias 지원
        LocalTime overtimeT = policy.getOvertimeStartLocalTime();

        if (!startT.isBefore(lateT)) {
            throw new IllegalArgumentException("START_TIME은 LATE_TIME보다 빨라야 합니다.");
        }
        if (!lateT.isBefore(overtimeT)) {
            throw new IllegalArgumentException("LATE_TIME은 OVERTIME_START보다 빨라야 합니다.");
        }

        // ===== 휴게시간 검증 (선택) =====
        Integer breakStart = policy.getBreakStart();
        Integer breakEnd = policy.getBreakEnd();

        // 둘 중 하나만 있으면 에러
        if ((breakStart == null) != (breakEnd == null)) {
            throw new IllegalArgumentException("휴게시간은 BREAK_START/BREAK_END 둘 다 필요합니다.");
        }

        // 둘 다 있으면 검증
        if (breakStart != null) {
            validateHhmm(breakStart, "breakStart");
            validateHhmm(breakEnd, "breakEnd");

            LocalTime bS = policy.getBreakStartLocalTime();
            LocalTime bE = policy.getBreakEndLocalTime();

            // (선택) breakStart/breakEnd가 start~overtime 범위 안인지
            if (!startT.isBefore(bS) || !bS.isBefore(bE) || !bE.isBefore(overtimeT)) {
                throw new IllegalArgumentException("휴게시간은 START_TIME과 OVERTIME_START 사이에 있어야 합니다. (START < BREAK_START < BREAK_END < OVERTIME_START)");
            }

            // (선택) 최소 60분 이상인지
            if (Duration.between(bS, bE).toMinutes() < 60) {
                throw new IllegalArgumentException("휴게시간은 최소 60분 이상이어야 합니다.");
            }
        }
    }

    private static void validateHhmm(Integer hhmm, String fieldName) {
        if (hhmm == null) throw new IllegalArgumentException(fieldName + " 값이 null 입니다.");
        int h = hhmm / 100;
        int m = hhmm % 100;
        if (h < 0 || h > 23 || m < 0 || m > 59) {
            throw new IllegalArgumentException(fieldName + "는 HHmm 형식의 유효한 시간이어야 합니다. (예: 0900, 1830)");
        }
    }
}
