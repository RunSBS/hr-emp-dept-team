package boot.team.hr.eun.attendance.repo;

import boot.team.hr.eun.attendance.entity.CompanyLocation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyLocationRepository
        extends JpaRepository<CompanyLocation, Long> {
}
