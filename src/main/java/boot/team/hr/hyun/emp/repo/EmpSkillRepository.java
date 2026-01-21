package boot.team.hr.hyun.emp.repo;

import boot.team.hr.hyun.emp.entity.Emp;
import boot.team.hr.hyun.emp.entity.EmpSkill;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.List;
import java.util.Optional;

public interface EmpSkillRepository extends JpaRepository<EmpSkill,Long> {
    Optional<EmpSkill> findByEmpIdAndSkillName(String empId, String skillName);

    @Modifying
    @Transactional
    void deleteByEmpId_EmpIdAndSkillName(String empId, String skillName);

    List<EmpSkill> findByEmpId_EmpId(String empId);
}
