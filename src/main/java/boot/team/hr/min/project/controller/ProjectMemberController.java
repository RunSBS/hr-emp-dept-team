package boot.team.hr.min.project.controller;

import boot.team.hr.min.project.dto.ProjectMemberDto;
import boot.team.hr.min.project.service.ProjectMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/project-members")
@RequiredArgsConstructor
public class ProjectMemberController {

    private final ProjectMemberService projectMemberService;

    // 멤버 추가
    @PreAuthorize("hasAnyRole('ADMIN','SCHEDULE')")
    @PostMapping
    public void addMember(@RequestBody Map<String, String> request) {
        Long projectId = Long.valueOf(request.get("projectId"));
        String empId = request.get("empId");
        String role = request.get("role");

        projectMemberService.addMember(projectId, empId, role);
    }

    // 프로젝트별 멤버 조회
    @GetMapping("/{projectId}")
    public List<ProjectMemberDto> getMembers(@PathVariable Long projectId) {
        return projectMemberService.findByProject(projectId);
    }

    // 역할 변경
    @PreAuthorize("hasAnyRole('ADMIN','SCHEDULE')")
    @PutMapping("/{id}/role")
    public void changeRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> request
    ) {
        projectMemberService.changeRole(id, request.get("role"));
    }

    // 멤버 삭제
    @PreAuthorize("hasAnyRole('ADMIN','SCHEDULE')")
    @DeleteMapping("/{id}")
    public void deleteMember(@PathVariable Long id) {
        projectMemberService.removeMember(id);
    }
    @GetMapping("/my")
    public List<ProjectMemberDto> getMyProjects(Authentication authentication) {
        // 로그인 세션에서 email 가져오기
        String email = authentication.getName();

        // Service에서 내 프로젝트 조회
        return projectMemberService.findMyProjects(email);
    }
}
