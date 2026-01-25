package boot.team.hr.eun.attendance.scheduler;

import boot.team.hr.eun.attendance.entity.AttendancePolicy;
import boot.team.hr.eun.attendance.entity.WorkRecord;
import boot.team.hr.eun.attendance.enums.WorkType;
import boot.team.hr.eun.attendance.repo.AttendancePolicyRepository;
import boot.team.hr.eun.attendance.repo.WorkRecordRepository;
import boot.team.hr.eun.attendance.util.WorkDateResolver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class NightWorkScheduler {

    private final WorkRecordRepository workRecordRepository;
    private final AttendancePolicyRepository policyRepository;

    /**
     * 야근 진행중(NIGHT) 전환:
     * - 오늘 레코드 중
     *   - checkIn != null (출근함)
     *   - checkOut == null (아직 퇴근 안 함)
     *   - workType == OFFICE (기본 근무중)
     * - 현재 시간이 OVERTIME_START + 1시간을 지났으면 NIGHT로 변경
     *
     * 주기: 1분마다(원하는대로 조정 가능)
     */
    @Transactional
    @Scheduled(cron = "0 * * * * *") // 매 분 0초
    public void markNightWorking() {

        LocalDate workDate = WorkDateResolver.today();

        AttendancePolicy policy = policyRepository.findPolicyByWorkDate(workDate)
                .orElse(null);

        if (policy == null) {
            // 정책 없으면 아무것도 못함
            return;
        }

        LocalDateTime nightThreshold = LocalDateTime.of(workDate, policy.getOvertimeStartLocalTime())
                .plusHours(1);

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(nightThreshold)) {
            return;
        }

        List<WorkRecord> targets = workRecordRepository.findAllNightCandidates(workDate, WorkType.OFFICE);

        for (WorkRecord r : targets) {
            // 방어적으로 한 번 더 체크
            if (r.getCheckIn() != null
                    && r.getCheckOut() == null
                    && r.getWorkType() == WorkType.OFFICE) {
                r.setWorkType(WorkType.NIGHT);
            }
        }
    }
}
