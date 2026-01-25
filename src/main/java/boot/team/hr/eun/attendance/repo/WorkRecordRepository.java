package boot.team.hr.eun.attendance.repo;

import boot.team.hr.eun.attendance.entity.WorkRecord;
import boot.team.hr.eun.attendance.enums.WorkStatus;
import boot.team.hr.eun.attendance.enums.WorkType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface WorkRecordRepository extends JpaRepository<WorkRecord, Long> {

    // 사원 단건 조회
    Optional<WorkRecord> findByEmployeeIdAndWorkDate(String empId, LocalDate date);

    // 출퇴근 내역 날짜 범위 조회
    List<WorkRecord> findByWorkDateBetween(LocalDate start, LocalDate end);

    // 개인 이력 조회용
    List<WorkRecord> findByEmployeeIdAndWorkDateBetween(String empId, LocalDate start, LocalDate end);

    // 특정 사원과 특정 날짜에 근무 기록이 있는지 알려주는 boolean
    boolean existsByEmployeeIdAndWorkDate(String empId, LocalDate workDate);

    // 특정 날짜에 workStatus를 알려줌 = 결근 마감용
    List<WorkRecord> findAllByWorkDateAndWorkStatus(LocalDate workDate, WorkStatus workStatus);

    @Query("""
    select wr
    from WorkRecord wr
    where wr.workDate = :workDate
      and wr.checkIn is not null
      and wr.checkOut is null
      and wr.workType = :officeType
""")
    List<WorkRecord> findAllNightCandidates(
            @Param("workDate") LocalDate workDate,
            @Param("officeType") WorkType officeType
    );

    @Query("""
    select wr
    from WorkRecord wr
    where wr.workDate = :workDate
      and wr.checkIn is not null
      and wr.checkOut is null
      and (wr.workType = :officeType or wr.workType = :nightType)
""")
    List<WorkRecord> findAllAutoCheckoutTargets(
            @Param("workDate") LocalDate workDate,
            @Param("officeType") WorkType officeType,
            @Param("nightType") WorkType nightType
    );

    List<WorkRecord> findByEmployeeIdInAndWorkDateBetween(
            List<String> empIds,
            LocalDate start,
            LocalDate end
    );


}
