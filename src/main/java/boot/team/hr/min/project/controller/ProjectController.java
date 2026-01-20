package boot.team.hr.min.project.controller;

import boot.team.hr.min.account.security.CustomUserDetails;
import boot.team.hr.min.project.dto.ProjectDto;
import boot.team.hr.min.project.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.nio.file.attribute.UserPrincipal;
import java.util.List;

@RestController
@RequestMapping("/project")
@RequiredArgsConstructor
public class ProjectController {
    private final ProjectService projectService;

    @PreAuthorize("hasAnyRole('ADMIN','SCHEDULE')")
    @PostMapping
    public ProjectDto createProject(@RequestBody ProjectDto projectDto){
        return projectService.create(projectDto);
    }

    @GetMapping("/all")
    public List<ProjectDto> findAllProject(){
        return projectService.findAll();
    }

    @GetMapping("/{id}")
    public ProjectDto findProject(@PathVariable Long id){
        return projectService.findById(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN','SCHEDULE')")
    @PutMapping("/{id}")
    public void updateProject(@PathVariable Long id,@RequestBody ProjectDto projectDto){
        projectService.update(id,projectDto);
    }

    @PreAuthorize("hasAnyRole('ADMIN','SCHEDULE')")
    @DeleteMapping("/{id}")
    public void deleteProject(@PathVariable Long id){
        projectService.delete(id);
    }

    @GetMapping()
    public Page<ProjectDto> getProjects(
            @PageableDefault(
                    size = 6,
                    sort = "id",
                    direction = Sort.Direction.DESC
            ) Pageable pageable,
            @RequestParam(required = false) String keyword
    ) {
        return projectService.findPage(pageable, keyword);
    }
    //내프로젝트 찾기
    @GetMapping("/my")
    public Page<ProjectDto> myProjects(
            @AuthenticationPrincipal CustomUserDetails user,
            Pageable pageable,
            @RequestParam(required = false) String keyword
    ) {
        return projectService.findMyProjects(
                user.getEmpId(),
                keyword,
                pageable
        );
    }
}
