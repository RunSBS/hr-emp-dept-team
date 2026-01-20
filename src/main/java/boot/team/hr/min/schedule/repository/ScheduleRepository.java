package boot.team.hr.min.schedule.repository;

import boot.team.hr.min.schedule.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule,Long> {
    // 사원별 일정 조회
    List<Schedule> findByEmp_EmpId(String empId);
}
