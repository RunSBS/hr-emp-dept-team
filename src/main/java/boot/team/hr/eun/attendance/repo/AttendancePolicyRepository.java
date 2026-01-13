package boot.team.hr.eun.attendance.repo;

import boot.team.hr.eun.attendance.entity.AttendancePolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AttendancePolicyRepository
        extends JpaRepository<AttendancePolicy, Long> {

    @Query("""
        SELECT p FROM AttendancePolicy p
        WHERE CURRENT_DATE BETWEEN p.effectiveFrom AND p.effectiveTo
    """)
    AttendancePolicy findCurrentPolicy();
}
