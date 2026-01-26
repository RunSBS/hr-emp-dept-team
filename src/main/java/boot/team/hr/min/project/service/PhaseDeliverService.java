package boot.team.hr.min.project.service;

import boot.team.hr.min.common.FileStorageService;
import boot.team.hr.min.project.dto.PhaseDeliverDto;
import boot.team.hr.min.project.entitiy.PhaseDeliver;
import boot.team.hr.min.project.entitiy.ProjectPhase;
import boot.team.hr.min.project.repository.PhaseDeliverRepository;
import boot.team.hr.min.project.repository.ProjectPhaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PhaseDeliverService {

    private final PhaseDeliverRepository deliverRepository;
    private final ProjectPhaseRepository projectPhaseRepository;
    private final FileStorageService fileStorageService;

    /* ===== C ===== */
    @Transactional
    public void create(PhaseDeliverDto dto) {

        ProjectPhase phase = projectPhaseRepository.findById(dto.getPhaseId())
                .orElseThrow(() -> new IllegalArgumentException("단계 없음"));

        PhaseDeliver deliver = PhaseDeliver.from(dto, phase);

    }

    /* ===== R (단계별) ===== */
    @Transactional(readOnly = true)
    public List<PhaseDeliverDto> findByPhaseId(Long phaseId) {
        return deliverRepository.findByProjectPhase_Id(phaseId)
                .stream()
                .map(PhaseDeliverDto::from)
                .toList();
    }

    /* ===== R (단건) ===== */
    @Transactional(readOnly = true)
    public PhaseDeliverDto findOne(Long id) {
        PhaseDeliver deliver = deliverRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("산출물 없음"));

        return PhaseDeliverDto.from(deliver);
    }

    @Transactional(readOnly = true) public List<PhaseDeliverDto> findAll(){
     return deliverRepository.findAll()
            .stream()
            .map(PhaseDeliverDto::from)
            .toList();
    }

    /* ===== U ===== */
    @Transactional
    public void update(Long id, PhaseDeliverDto dto) {

        PhaseDeliver deliver = deliverRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("산출물 없음"));

        ProjectPhase phase = projectPhaseRepository.findById(dto.getPhaseId())
                .orElseThrow(() -> new IllegalArgumentException("단계 없음"));

        deliver.update(dto, phase);
    }

    /* ===== D ===== */
    @Transactional
    public void delete(Long id) {
        deliverRepository.deleteById(id);
    }

    /* ===== 파일 업로드 ===== */
    @Transactional
    public Long upload(Long phaseId, String name, String description, MultipartFile file) {

        ProjectPhase phase = projectPhaseRepository.findById(phaseId)
                .orElseThrow(() -> new IllegalArgumentException("단계 없음"));

        String savedPath = fileStorageService.save(file);

        PhaseDeliver deliver = PhaseDeliver.builder()
                .projectPhase(phase)
                .name(name)
                .description(description)
                .filePath(savedPath)
                .status("UPLOADED")
                .build();

        return deliverRepository.save(deliver).getId();
    }

    @Transactional(readOnly = true)
    public PhaseDeliver findEntityById(Long id) {
        return deliverRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("산출물이 존재하지 않습니다."));
    }
}

