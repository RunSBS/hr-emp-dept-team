package boot.team.hr.eun.attendance.dto;

import boot.team.hr.eun.attendance.entity.WorkRecord;
import boot.team.hr.eun.attendance.repo.WorkRecordRepository;
import boot.team.hr.hyun.emp.entity.Emp;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class AttendanceListResponseDto {
    private String empId;
    private String empName;
    private LocalDate workDate;
    private LocalDateTime checkIn;
    private LocalDateTime checkOut;
    private String workStatus;
    private String workType;
    private Integer totalWorkMinutes;

    public static AttendanceListResponseDto from(WorkRecord workRecord, Emp emp) {
        return AttendanceListResponseDto.builder()
                .empId(emp.getEmpId())
                .empName(emp.getEmpName())
                .workDate(workRecord.getWorkDate())
                .checkIn(workRecord.getCheckIn())
                .checkOut(workRecord.getCheckOut())
                .workStatus(workRecord.getWorkStatus())
                .workType(workRecord.getWorkType())
                .totalWorkMinutes(workRecord.getTotalWorkMinutes())
                .build();
    }
}
