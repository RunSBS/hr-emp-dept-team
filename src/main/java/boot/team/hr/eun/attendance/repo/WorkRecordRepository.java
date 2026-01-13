package boot.team.hr.eun.attendance.repo;

import boot.team.hr.eun.attendance.entity.WorkRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface WorkRecordRepository extends JpaRepository<WorkRecord, Long> {
    Optional<WorkRecord> findByEmployeeIdAndWorkDate(Long empId, LocalDate date);
}
