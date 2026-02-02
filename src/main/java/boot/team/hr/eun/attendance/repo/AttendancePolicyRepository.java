package boot.team.hr.eun.attendance.repo;

import boot.team.hr.eun.attendance.entity.AttendancePolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendancePolicyRepository
        extends JpaRepository<AttendancePolicy, Long> {

    /* ===================== 현재 적용 정책 ===================== */
    @Query("""
        select p
        from AttendancePolicy p
        where :workDate between p.effectiveFrom and p.effectiveTo
    """)
    Optional<AttendancePolicy> findPolicyByWorkDate(
            @Param("workDate") LocalDate workDate
    );

    /* Service에서 today 넘기기 싫으면 오버로드 */
    default Optional<AttendancePolicy> findCurrentPolicy() {
        return findPolicyByWorkDate(LocalDate.now());
    }

    /* ===================== 기간 겹침 검사 ===================== */
    @Query("""
        SELECT COUNT(p) > 0
        FROM AttendancePolicy p
        WHERE (:policyId IS NULL OR p.policyId <> :policyId)
          AND p.effectiveFrom <= :endDate
          AND p.effectiveTo >= :startDate
    """)
    boolean existsOverlappingPolicy(
            @Param("policyId") Long policyId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /* ===================== 전체 정책 (정렬) ===================== */
    List<AttendancePolicy> findAllByOrderByEffectiveFromDesc();
}
