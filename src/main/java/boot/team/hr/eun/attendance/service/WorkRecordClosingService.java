package boot.team.hr.eun.attendance.service;

import boot.team.hr.eun.attendance.entity.WorkRecord;
import boot.team.hr.eun.attendance.enums.WorkStatus;
import boot.team.hr.eun.attendance.enums.WorkType;
import boot.team.hr.eun.attendance.repo.WorkRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkRecordClosingService {

    private final WorkRecordRepository workRecordRepository;

    /**
     * 근무 마감 처리 (결근 확정)
     * → 18:00 이후, 출근 안 한 PENDING만 ABSENT
     */
    public void closeWorkDate(LocalDate workDate) {

        // 주말 제외
        if (isWeekend(workDate)) return;

        // 🔥 18:00 이전이면 마감 안 함
        if (LocalTime.now().isBefore(LocalTime.of(18, 0))) {
            return;
        }

        List<WorkRecord> pendingRecords =
                workRecordRepository.findAllByWorkDateAndWorkStatus(
                        workDate,
                        WorkStatus.PENDING
                );

        for (WorkRecord record : pendingRecords) {

            // ✅ 이미 출근한 사람은 제외
            if (record.getCheckIn() != null) {
                continue;
            }

            record.setWorkStatus(WorkStatus.ABSENT);
            record.setWorkType(WorkType.OFF);

            // 무단결근 → 전일 무급
            record.setUnpaidMinutes(540);
            record.setNormalWorkMinutes(0);
            record.setOvertimeWorkMinutes(0);
            record.setTotalWorkMinutes(0);
        }
    }

    private boolean isWeekend(LocalDate date) {
        return date.getDayOfWeek().getValue() >= 6;
    }
}


