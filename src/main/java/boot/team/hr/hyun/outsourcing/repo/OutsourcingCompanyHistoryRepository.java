package boot.team.hr.hyun.outsourcing.repo;

import boot.team.hr.hyun.outsourcing.entity.OutsourcingCompanyHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OutsourcingCompanyHistoryRepository extends JpaRepository<OutsourcingCompanyHistory, Long> {
    List<OutsourcingCompanyHistory> findByCompanyIdOrderByCreatedAtDesc(Long companyId);
}