package boot.team.hr.eun.payroll.repo;

import boot.team.hr.eun.payroll.entity.PayrollPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface PayrollPolicyRepository extends JpaRepository<PayrollPolicy, Long> {

    // "현재 적용 정책" 개념이 따로 없으면 최신 1건으로
    @Query("""
        select p
        from PayrollPolicy p
        order by p.updatedAt desc
    """)
    java.util.List<PayrollPolicy> findLatestFirst();
}
