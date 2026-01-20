package boot.team.hr.eun.attendance.repo;

import boot.team.hr.eun.attendance.entity.WorkRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface WorkRecordRepository extends JpaRepository<WorkRecord, Long> {

    Optional<WorkRecord> findByEmployeeIdAndWorkDate(String empId, LocalDate date);

    List<WorkRecord> findByWorkDateBetween(LocalDate start, LocalDate end);

    List<WorkRecord> findByEmployeeIdAndWorkDateBetween(String empId, LocalDate start, LocalDate end);

}
