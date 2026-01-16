package boot.team.hr.min.schedule.service;

import boot.team.hr.hyun.emp.entity.Emp;
import boot.team.hr.hyun.emp.repo.EmpRepository;
import boot.team.hr.min.schedule.dto.ScheduleDto;
import boot.team.hr.min.schedule.entity.Schedule;
import boot.team.hr.min.schedule.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final EmpRepository empRepository;

    /* 일정 생성 */
    public ScheduleDto create(ScheduleDto dto) {
        Emp emp = empRepository.findById(dto.getEmpId())
                .orElseThrow(() -> new IllegalArgumentException("사원 없음"));

        Schedule schedule = new Schedule(
                emp,
                dto.getTitle(),
                dto.getStartAt(),
                dto.getEndAt(),
                dto.getDescription()
        );

        return ScheduleDto.from(scheduleRepository.save(schedule));
    }

    /* 일정 단건 조회 */
    @Transactional(readOnly = true)
    public ScheduleDto get(Long id) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("일정 없음"));

        return ScheduleDto.from(schedule);
    }

    /* 사원별 일정 조회 */
    @Transactional(readOnly = true)
    public List<ScheduleDto> getByEmp(String empId) {
        return scheduleRepository.findByEmp_EmpId(empId)
                .stream()
                .map(ScheduleDto::from)
                .toList();
    }
    //전체조회
    @Transactional(readOnly = true)
    public List<ScheduleDto> getAll() {
        return scheduleRepository.findAll()
                .stream()
                .map(ScheduleDto::from)
                .toList();
    }
    /* 일정 수정 */
    public ScheduleDto update(Long id, ScheduleDto dto) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("일정 없음"));

        Emp emp = empRepository.findById(dto.getEmpId())
                .orElseThrow(() -> new IllegalArgumentException("사원 없음"));

        schedule.update(
                emp,
                dto.getTitle(),
                dto.getStartAt(),
                dto.getEndAt(),
                dto.getDescription()
        );

        return ScheduleDto.from(schedule);
    }

    /* 일정 삭제 */
    public void delete(Long id) {
        scheduleRepository.deleteById(id);
    }
}
