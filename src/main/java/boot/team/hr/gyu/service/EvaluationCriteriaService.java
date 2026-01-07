package boot.team.hr.gyu.service;

import boot.team.hr.gyu.dto.EvaluationCriteriaDTO;
import boot.team.hr.gyu.entity.EvaluationCriteria;
import boot.team.hr.gyu.repository.EvaluationCriteriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class EvaluationCriteriaService {

    private final EvaluationCriteriaRepository repository;

    @Autowired
    public EvaluationCriteriaService(EvaluationCriteriaRepository repository) {
        this.repository = repository;
    }

    // 전체 조회
    @Transactional(readOnly = true)
    public List<EvaluationCriteriaDTO> getAllCriteria() {
        return repository.findAllByOrderByCreatedAtDesc().stream()
                .map(EvaluationCriteriaDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // ID로 조회
    @Transactional(readOnly = true)
    public EvaluationCriteriaDTO getCriteriaById(Long id) {
        EvaluationCriteria entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("평가 항목을 찾을 수 없습니다. ID: " + id));
        return EvaluationCriteriaDTO.fromEntity(entity);
    }

    // 생성
    public EvaluationCriteriaDTO createCriteria(EvaluationCriteriaDTO dto) {
        // 중복 체크
        if (repository.existsByCriteriaName(dto.getCriteriaName())) {
            throw new RuntimeException("이미 존재하는 평가 항목명입니다: " + dto.getCriteriaName());
        }

        EvaluationCriteria entity = new EvaluationCriteria(
                dto.getCriteriaName(),
                dto.getWeight(),
                dto.getDescription()
        );

        EvaluationCriteria savedEntity = repository.save(entity);
        return EvaluationCriteriaDTO.fromEntity(savedEntity);
    }

    // 수정
    public EvaluationCriteriaDTO updateCriteria(Long id, EvaluationCriteriaDTO dto) {
        EvaluationCriteria entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("평가 항목을 찾을 수 없습니다. ID: " + id));

        // 항목명 중복 체크 (자기 자신 제외)
        if (!entity.getCriteriaName().equals(dto.getCriteriaName()) &&
            repository.existsByCriteriaName(dto.getCriteriaName())) {
            throw new RuntimeException("이미 존재하는 평가 항목명입니다: " + dto.getCriteriaName());
        }

        entity.setCriteriaName(dto.getCriteriaName());
        entity.setWeight(dto.getWeight());
        entity.setDescription(dto.getDescription());

        EvaluationCriteria updatedEntity = repository.save(entity);
        return EvaluationCriteriaDTO.fromEntity(updatedEntity);
    }

    // 삭제
    public void deleteCriteria(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("평가 항목을 찾을 수 없습니다. ID: " + id);
        }
        repository.deleteById(id);
    }

    // 가중치 수정
    public EvaluationCriteriaDTO updateWeight(Long id, Integer weight) {
        EvaluationCriteria entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("평가 항목을 찾을 수 없습니다. ID: " + id));

        entity.setWeight(weight);
        EvaluationCriteria updatedEntity = repository.save(entity);
        return EvaluationCriteriaDTO.fromEntity(updatedEntity);
    }
}