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

    /* =====================
       C - 생성
     ===================== */
    @Transactional
    public PhaseDeliverDto create(PhaseDeliverDto dto) {

        ProjectPhase phase = projectPhaseRepository.findById(dto.getPhaseId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 단계입니다."));

        PhaseDeliver deliver = new PhaseDeliver(
                phase,
                dto.getName(),
                dto.getDescription(),
                dto.getFilePath(),
                LocalDateTime.now(),
                LocalDateTime.now(),
                dto.getStatus()
        );

        return PhaseDeliverDto.from(deliverRepository.save(deliver));
    }
    @Transactional(readOnly = true)
    public List<PhaseDeliverDto> findByPhaseId(Long phaseId) {

        return deliverRepository.findByProjectPhase_Id(phaseId)
                .stream()
                .map(PhaseDeliverDto::from)
                .collect(Collectors.toList());
    }
    /* =====================
       R - 전체 조회
     ===================== */
    @Transactional(readOnly = true)
    public List<PhaseDeliverDto> findAll() {
        return deliverRepository.findAll()
                .stream()
                .map(PhaseDeliverDto::from)
                .toList();
    }

    /* =====================
       R - 단건 조회
     ===================== */
    @Transactional(readOnly = true)
    public PhaseDeliverDto findOne(Long phaseDeliverId) {
        PhaseDeliver deliver = deliverRepository.findById(phaseDeliverId)
                .orElseThrow(() -> new IllegalArgumentException("산출물이 존재하지 않습니다."));

        return PhaseDeliverDto.from(deliver);
    }

    /* =====================
       U - 수정
     ===================== */
    @Transactional
    public void update(Long phaseDeliverId, PhaseDeliverDto dto) {

        PhaseDeliver deliver = deliverRepository.findById(phaseDeliverId)
                .orElseThrow(() -> new IllegalArgumentException("산출물이 존재하지 않습니다."));

        ProjectPhase phase = projectPhaseRepository.findById(dto.getPhaseId())
                .orElseThrow(() -> new IllegalArgumentException("단계가 존재하지 않습니다."));

        deliver.update(
                phase,
                dto.getName(),
                dto.getDescription(),
                dto.getFilePath(),
                deliver.getCreated_at(),      // 생성일 유지
                LocalDateTime.now(),          // 수정일 갱신
                dto.getStatus()
        );
    }

    /* =====================
       D - 삭제
     ===================== */
    @Transactional
    public void delete(Long phaseDeliverId) {
        if (!deliverRepository.existsById(phaseDeliverId)) {
            throw new IllegalArgumentException("삭제할 산출물이 없습니다.");
        }
        deliverRepository.deleteById(phaseDeliverId);
    }
    @Transactional
    public void upload(Long phaseId, String name, String description, MultipartFile file) {
        ProjectPhase phase = projectPhaseRepository.findById(phaseId)
                .orElseThrow(() -> new IllegalArgumentException("단계 없음"));

        String savedPath = fileStorageService.save(file);

        PhaseDeliver deliver = new PhaseDeliver(
                phase,
                name,
                description,
                savedPath,
                LocalDateTime.now(),
                null,
                "UPLOADED"
        );

        deliverRepository.save(deliver);
    }
    @Transactional(readOnly = true)
    public PhaseDeliver findEntityById(Long id) {
        return deliverRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("산출물이 존재하지 않습니다."));
    }
}
