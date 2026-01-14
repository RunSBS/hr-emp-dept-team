package boot.team.hr.min.project.controller;

import boot.team.hr.min.project.dto.ProjectPhaseDto;
import boot.team.hr.min.project.service.ProjectPhaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/project-phases")
@RequiredArgsConstructor
public class ProjectPhaseController {

    private final ProjectPhaseService phaseService;

    // 생성
    @PostMapping("/{projectId}")
    public ProjectPhaseDto createPhase(@PathVariable Long projectId, @RequestBody ProjectPhaseDto dto) {
        return phaseService.createPhase(projectId, dto);
    }

    // 프로젝트별 단계 조회
    @GetMapping("/project/{projectId}")
    public List<ProjectPhaseDto> getPhasesByProject(@PathVariable Long projectId) {
        return phaseService.getPhasesByProject(projectId);
    }

    // 단일 단계 조회
    @GetMapping("/{phaseId}")
    public ProjectPhaseDto getPhase(@PathVariable Long phaseId) {
        return phaseService.getPhase(phaseId);
    }

    // 수정
    @PutMapping("/{phaseId}")
    public ProjectPhaseDto updatePhase(@PathVariable Long phaseId, @RequestBody ProjectPhaseDto dto) {
        return phaseService.updatePhase(phaseId, dto);
    }

    // 삭제
    @DeleteMapping("/{phaseId}")
    public void deletePhase(@PathVariable Long phaseId) {
        phaseService.deletePhase(phaseId);
    }
}
