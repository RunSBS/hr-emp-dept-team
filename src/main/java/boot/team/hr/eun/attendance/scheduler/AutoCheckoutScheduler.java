package boot.team.hr.eun.attendance.scheduler;

import boot.team.hr.eun.attendance.entity.AttendancePolicy;
import boot.team.hr.eun.attendance.entity.WorkRecord;
import boot.team.hr.eun.attendance.enums.WorkStatus;
import boot.team.hr.eun.attendance.enums.WorkType;
import boot.team.hr.eun.attendance.repo.AttendancePolicyRepository;
import boot.team.hr.eun.attendance.repo.WorkRecordRepository;
import boot.team.hr.eun.attendance.util.AttendanceTimeCalculator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class AutoCheckoutScheduler {

    private final WorkRecordRepository workRecordRepository;
    private final AttendancePolicyRepository policyRepository;

    /**
     * ✅ 법정 야근 한도 자동 퇴근 처리
     * - 대상: checkIn != null AND checkOut == null AND (OFFICE or NIGHT)
     * - 기준: 다음날 06:00이 되었는데도 퇴근이 안 찍혀있으면
     *         checkOut = workDate+1 06:00 으로 자동 기록 + 분 계산
     *
     * 주기: 1분마다
     */
    @Transactional
    @Scheduled(cron = "0 * * * * *")
    public void autoCheckOutAtSixAM() {

        LocalDate today = LocalDate.now();

        // 어제 날짜 레코드 중에서, 아직 퇴근 안 된 사람을 마감 처리해야 함
        LocalDate workDate = today.minusDays(1);

        AttendancePolicy policy = policyRepository.findPolicyByWorkDate(workDate).orElse(null);
        if (policy == null) return;

        LocalDateTime cutoff = LocalDateTime.of(today, LocalTime.of(6, 0)); // ✅ 오늘 06:00 = 어제 근무의 마감
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(cutoff)) return;

        List<WorkRecord> targets =
                workRecordRepository.findAllAutoCheckoutTargets(workDate, WorkType.OFFICE, WorkType.NIGHT);


        for (WorkRecord record : targets) {

            // 방어 체크
            if (record.getCheckIn() == null) continue;
            if (record.getCheckOut() != null) continue;

            // 자동 퇴근 시간 = (근무일 + 1일) 06:00
            LocalDateTime autoCheckoutTime = LocalDateTime.of(workDate.plusDays(1), LocalTime.of(6, 0));
            record.setCheckOut(autoCheckoutTime);

            // 분 계산
            var time = AttendanceTimeCalculator.calculateAtCheckOut(
                    record.getCheckIn(),
                    autoCheckoutTime,
                    policy
            );

            record.setNormalWorkMinutes(time.normalWorkMinutes());
            record.setOvertimeWorkMinutes(time.overtimeWorkMinutes());
            record.setUnpaidMinutes(time.unpaidMinutes());
            record.setTotalWorkMinutes(time.totalWorkMinutes());

            // 상태 결정 (조퇴 기준: OVERTIME_START 이전이면 조퇴, 아니면 기존 지각 유지/정상)
            WorkStatus finalStatus = WorkStatus.decideAtCheckOut(
                    record.getWorkStatus(),
                    autoCheckoutTime,
                    policy.getOvertimeStartLocalTime()
            );
            record.setWorkStatus(finalStatus);

            // ✅ 퇴근했으니 OFF
            record.setWorkType(WorkType.OFF);

            log.info("[AUTO CHECK-OUT] empId={}, workDate={}, checkOut={}",
                    record.getEmployeeId(), record.getWorkDate(), record.getCheckOut());
        }
    }
}
