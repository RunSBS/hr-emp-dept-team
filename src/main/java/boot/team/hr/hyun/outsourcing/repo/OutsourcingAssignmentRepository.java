package boot.team.hr.hyun.outsourcing.repo;

import boot.team.hr.hyun.outsourcing.entity.OutsourcingAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

public interface OutsourcingAssignmentRepository extends JpaRepository<OutsourcingAssignment,Long> {

    @Query("""
        SELECT COUNT(o) > 0
        FROM OutsourcingAssignment o
        WHERE o.emp = :empId
        AND :workDate BETWEEN o.startDate AND o.endDate
    """)
    boolean existsAssignment(
            @Param("empId") String empId,
            @Param("workDate") LocalDate workDate
    );

}
