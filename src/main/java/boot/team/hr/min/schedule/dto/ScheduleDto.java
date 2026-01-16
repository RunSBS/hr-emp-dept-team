package boot.team.hr.min.schedule.dto;

import boot.team.hr.min.schedule.entity.Schedule;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ScheduleDto {
    private Long id;
    private String empId;
    private String title;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private String description;

    public static ScheduleDto from(Schedule schedule) {
        ScheduleDto scheduleDto = new ScheduleDto();
        scheduleDto.setId(schedule.getId());
        scheduleDto.setEmpId(schedule.getEmp().getEmpId());
        scheduleDto.setTitle(schedule.getTitle());
        scheduleDto.setStartAt(schedule.getStartAt());
        scheduleDto.setEndAt(schedule.getEndAt());
        scheduleDto.setDescription(schedule.getDescription());
        return scheduleDto;
    }
}
