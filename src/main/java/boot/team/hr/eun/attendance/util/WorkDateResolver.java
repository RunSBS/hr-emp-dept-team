package boot.team.hr.eun.attendance.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class WorkDateResolver {

    private static final LocalTime DAY_CUTOFF = LocalTime.of(6, 0);

    public static LocalDate resolve(LocalDateTime now) {
        if (now.toLocalTime().isBefore(DAY_CUTOFF)) {
            return now.toLocalDate().minusDays(1);
        }
        return now.toLocalDate();
    }

    public static LocalDate today() {
        return resolve(LocalDateTime.now());
    }
}
