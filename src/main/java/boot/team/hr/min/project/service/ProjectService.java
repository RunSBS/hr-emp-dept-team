package boot.team.hr.min.project.service;

import boot.team.hr.min.project.dto.ProjectDto;
import boot.team.hr.min.project.entitiy.Project;
import boot.team.hr.min.project.repository.ProjectMemberRepository;
import boot.team.hr.min.project.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository repository;
    private final ProjectMemberRepository projectMemberRepository;


    //c
    @Transactional
    public ProjectDto create(ProjectDto dto){
        Project project = new Project(
                dto.getName(),
                dto.getDescription(),
                dto.getMethodology(),
                dto.getStartDate(),
                dto.getEndDate(),
                dto.getStatus()
        );
        Project saved = repository.save(project);
        return ProjectDto.from(saved);
    }
    //r
    @Transactional(readOnly = true)
    public List<ProjectDto> findAll(){
        return repository.findAll()
                .stream()
                .map(ProjectDto::from)
                .toList();
    }
    @Transactional(readOnly = true)
    public ProjectDto findById(Long id){
        Project project=repository.findById(id)
                .orElseThrow(()->new IllegalArgumentException("해당 프로젝트 없음"));
        return ProjectDto.from(project);
    }
    //u
    @Transactional
    public void update(Long id, ProjectDto dto){
        Project project=repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 프로젝트 없음"));
        project.update(
                dto.getName(),
                dto.getDescription(),
                dto.getMethodology(),
                dto.getStartDate(),
                dto.getEndDate(),
                dto.getStatus());
    }
    //d
    @Transactional
    public void delete(Long id){
        repository.deleteById(id);
    }
    //page
    @Transactional(readOnly = true)
    public Page<ProjectDto> findPage(Pageable pageable, String keyword) {

        Page<Project> page;
        if (keyword == null || keyword.trim().isEmpty()) {
            page = repository.findAll(pageable);
        }
        else {
            page = repository.findByNameContainingIgnoreCase(keyword, pageable);
        }

        return page.map(ProjectDto::from);
    }
    @Transactional(readOnly = true)
    public Page<ProjectDto> findMyProjects(
            String empId,
            String keyword,
            Pageable pageable
    ) {
        return projectMemberRepository.findMyProjects(empId, keyword, pageable);
    }

}
