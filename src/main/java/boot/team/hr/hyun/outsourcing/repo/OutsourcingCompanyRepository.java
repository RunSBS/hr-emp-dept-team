package boot.team.hr.hyun.outsourcing.repo;

import boot.team.hr.hyun.outsourcing.entity.OutsourcingCompany;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OutsourcingCompanyRepository extends JpaRepository<OutsourcingCompany,Long> {
    void deleteByCompanyName(String companyName);
}
