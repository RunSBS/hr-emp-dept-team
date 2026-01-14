package boot.team.hr.min.project.service;

import boot.team.hr.min.project.dto.ProjectPhaseDto;
import boot.team.hr.min.project.entitiy.Project;
import boot.team.hr.min.project.entitiy.ProjectPhase;
import boot.team.hr.min.project.repository.ProjectPhaseRepository;
import boot.team.hr.min.project.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectPhaseService {

    private final ProjectPhaseRepository phaseRepository;
    private final ProjectRepository projectRepository;

    // 생성
    @Transactional
    public ProjectPhaseDto createPhase(Long projectId, ProjectPhaseDto dto) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("프로젝트 없음"));

        ProjectPhase phase = new ProjectPhase(
                project,
                dto.getName(),
                dto.getDescription(),
                dto.getSequence(),
                dto.getStartDate(),
                dto.getEndDate(),
                dto.getStatus()
        );

        phaseRepository.save(phase);

        return ProjectPhaseDto.from(phase);
    }

    // 조회 (프로젝트별)
    @Transactional(readOnly = true)
    public List<ProjectPhaseDto> getPhasesByProject(Long projectId) {
        return phaseRepository.findByProjectIdOrderBySequence(projectId)
                .stream()
                .map(ProjectPhaseDto::from)
                .collect(Collectors.toList());
    }

    // 조회 (단일 단계)
    @Transactional(readOnly = true)
    public ProjectPhaseDto getPhase(Long phaseId) {
        ProjectPhase phase = phaseRepository.findById(phaseId)
                .orElseThrow(() -> new IllegalArgumentException("단계 없음"));
        return ProjectPhaseDto.from(phase);
    }

    // 수정
    @Transactional
    public ProjectPhaseDto updatePhase(Long phaseId, ProjectPhaseDto dto) {
        ProjectPhase phase = phaseRepository.findById(phaseId)
                .orElseThrow(() -> new IllegalArgumentException("단계 없음"));

        // 프로젝트는 변경하지 않는 경우
        phase.update(
                phase.getProject(),
                dto.getName(),
                dto.getDescription(),
                dto.getSequence(),
                dto.getStartDate(),
                dto.getEndDate(),
                dto.getStatus()
        );

        return ProjectPhaseDto.from(phase);
    }

    // 삭제
    @Transactional
    public void deletePhase(Long phaseId) {
        phaseRepository.deleteById(phaseId);
    }
}
