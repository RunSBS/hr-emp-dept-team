package boot.team.hr.hyun.outsourcing.repo;

import boot.team.hr.hyun.emp.entity.Emp;
import boot.team.hr.hyun.outsourcing.entity.OutsourcingAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

public interface OutsourcingAssignmentRepository extends JpaRepository<OutsourcingAssignment,Long> {

    @Query("""
        select (count(a) > 0)
        from OutsourcingAssignment a
        where a.emp = :emp
        and :workDate between a.startDate and a.endDate
    """)
    boolean existsAssignment(
            @Param("emp") Emp emp,
            @Param("workDate") LocalDate workDate
    );



}
