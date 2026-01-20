package boot.team.hr.min.project.service;

import boot.team.hr.hyun.emp.entity.Emp;
import boot.team.hr.hyun.emp.repo.EmpRepository;
import boot.team.hr.min.project.dto.ProjectDto;
import boot.team.hr.min.project.dto.ProjectMemberDto;
import boot.team.hr.min.project.entitiy.Project;
import boot.team.hr.min.project.entitiy.ProjectMember;
import boot.team.hr.min.project.repository.ProjectMemberRepository;
import boot.team.hr.min.project.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectMemberService {
    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectRepository projectRepository;
    private final EmpRepository empRepository;

    // 멤버 추가
    @Transactional
    public void addMember(Long projectId, String empId, String role) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("프로젝트 없음"));

        Emp emp = empRepository.findById(empId)
                .orElseThrow(() -> new IllegalArgumentException("사원 없음"));

        ProjectMember member = new ProjectMember(project, emp, role);
        projectMemberRepository.save(member);
    }

    @Transactional(readOnly = true)
    public List<ProjectMemberDto> findByProject(Long projectId) {
        return projectMemberRepository.findByProject_Id(projectId)
                .stream()
                .map(ProjectMemberDto::from)
                .toList();
    }

    // 역할 변경
    @Transactional
    public void changeRole(Long projectMemberId, String role) {
        ProjectMember member = projectMemberRepository.findById(projectMemberId)
                .orElseThrow(() -> new IllegalArgumentException("프로젝트 멤버 없음"));

        member.changeRole(role);
    }

    // 멤버 삭제
    @Transactional
    public void removeMember(Long projectMemberId) {
        projectMemberRepository.deleteById(projectMemberId);
    }
    //내프로젝트 찾기
    public List<ProjectMemberDto> findMyProjects(String email) {
        Emp emp = empRepository.findByEmail(email)
                .orElseThrow();

        String empId = emp.getEmpId();

        return projectMemberRepository.findByEmp_EmpId(empId) // 수정된 메서드
                .stream()
                .map(ProjectMemberDto::from)
                .toList();
    }

}
