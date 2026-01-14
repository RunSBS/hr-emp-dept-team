package boot.team.hr.min.project.repository;

import boot.team.hr.min.project.dto.ProjectMemberDto;
import boot.team.hr.min.project.entitiy.ProjectMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {

    List<ProjectMember> findByProject_Id(Long projectId);

    List<ProjectMember> findByEmp_EmpId(String empId);
}
