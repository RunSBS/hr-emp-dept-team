package boot.team.hr.min.project.repository;

import boot.team.hr.min.project.dto.ProjectDto;
import boot.team.hr.min.project.dto.ProjectMemberDto;
import boot.team.hr.min.project.entitiy.ProjectMember;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {

    List<ProjectMember> findByProject_Id(Long projectId);

    List<ProjectMember> findByEmp_EmpId(String empId);

    @Query("""
    select new boot.team.hr.min.project.dto.ProjectDto(
        p.id,
        p.name,
        p.description,
        p.methodology,
        p.startDate,
        p.endDate,
        p.status
    )
    from ProjectMember pm
    join pm.project p
    where pm.emp.empId = :empId
      and (
           :keyword is null
           or :keyword = ''
           or lower(p.name) like lower(concat('%', :keyword, '%'))
      )
""")
    Page<ProjectDto> findMyProjects(
            @Param("empId") String empId,
            @Param("keyword") String keyword,
            Pageable pageable
    );
}
