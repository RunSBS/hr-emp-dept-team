package boot.team.hr.eun.attendance.repo;

import boot.team.hr.eun.attendance.entity.AttendancePolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Optional;

public interface AttendancePolicyRepository
        extends JpaRepository<AttendancePolicy, Long> {

    @Query("""
        SELECT p FROM AttendancePolicy p
        WHERE CURRENT_DATE BETWEEN p.effectiveFrom AND p.effectiveTo
    """)
    Optional<AttendancePolicy> findCurrentPolicy();

    /* ===================== 기간 중복 체크 ===================== */
    @Query("""
        SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END
        FROM AttendancePolicy p
        WHERE p.policyId <> :policyId
          AND NOT (
              :effectiveTo < p.effectiveFrom
              OR :effectiveFrom > p.effectiveTo
          )
    """)
    Boolean existsOverlappingPolicy(
            @Param("policyId") Long policyId,
            @Param("effectiveFrom") LocalDate effectiveFrom,
            @Param("effectiveTo") LocalDate effectiveTo
    );
}
