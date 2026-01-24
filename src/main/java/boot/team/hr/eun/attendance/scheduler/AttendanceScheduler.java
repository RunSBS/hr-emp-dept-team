package boot.team.hr.eun.attendance.scheduler;

import boot.team.hr.eun.attendance.service.WorkRecordClosingService;
import boot.team.hr.eun.attendance.service.WorkRecordInitializerService;
import boot.team.hr.eun.attendance.util.WorkDateResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@EnableScheduling
public class AttendanceScheduler {

    private final WorkRecordInitializerService initializerService;
    private final WorkRecordClosingService closingService;

    @Scheduled(cron = "0 0 6 * * MON-FRI")
    public void createDailyRecords() {
        initializerService.createDailyPendingRecords(
                WorkDateResolver.today()
        );
    }

    @Scheduled(cron = "0 0 18 * * MON-FRI")
    public void closeDailyRecords() {
        closingService.closeWorkDate(
                WorkDateResolver.today()
        );
    }
}
