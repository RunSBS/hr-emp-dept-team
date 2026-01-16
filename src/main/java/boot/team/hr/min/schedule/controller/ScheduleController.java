package boot.team.hr.min.schedule.controller;

import boot.team.hr.min.schedule.dto.ScheduleDto;
import boot.team.hr.min.schedule.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    /* 일정 생성 */
    @PostMapping
    public ScheduleDto create(@RequestBody ScheduleDto dto) {
        return scheduleService.create(dto);
    }

    /* 일정 단건 조회 */
    @GetMapping("/{id}")
    public ScheduleDto get(@PathVariable Long id) {
        return scheduleService.get(id);
    }
    //전체 조회
    @GetMapping
    public List<ScheduleDto> getAll() {
        return scheduleService.getAll();
    }

    /* 사원별 일정 조회 */
    @GetMapping("/emp/{empId}")
    public List<ScheduleDto> getByEmp(@PathVariable String empId) {
        return scheduleService.getByEmp(empId);
    }

    /* 일정 수정 */
    @PutMapping("/{id}")
    public ScheduleDto update(
            @PathVariable Long id,
            @RequestBody ScheduleDto dto
    ) {
        return scheduleService.update(id, dto);
    }

    /* 일정 삭제 */
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        scheduleService.delete(id);
    }
}
