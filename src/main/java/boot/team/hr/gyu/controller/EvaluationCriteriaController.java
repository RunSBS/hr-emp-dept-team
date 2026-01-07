package boot.team.hr.gyu.controller;

import boot.team.hr.gyu.dto.EvaluationCriteriaDTO;
import boot.team.hr.gyu.service.EvaluationCriteriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/evaluation/criteria")
@CrossOrigin(origins = "*")
public class EvaluationCriteriaController {

    private final EvaluationCriteriaService service;

    @Autowired
    public EvaluationCriteriaController(EvaluationCriteriaService service) {
        this.service = service;
    }

    // 전체 조회
    @GetMapping
    public ResponseEntity<List<EvaluationCriteriaDTO>> getAllCriteria() {
        try {
            List<EvaluationCriteriaDTO> criteria = service.getAllCriteria();
            return ResponseEntity.ok(criteria);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ID로 조회
    @GetMapping("/{id}")
    public ResponseEntity<EvaluationCriteriaDTO> getCriteriaById(@PathVariable Long id) {
        try {
            EvaluationCriteriaDTO criteria = service.getCriteriaById(id);
            return ResponseEntity.ok(criteria);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 생성
    @PostMapping
    public ResponseEntity<EvaluationCriteriaDTO> createCriteria(@RequestBody EvaluationCriteriaDTO dto) {
        try {
            EvaluationCriteriaDTO createdCriteria = service.createCriteria(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdCriteria);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 수정
    @PutMapping("/{id}")
    public ResponseEntity<EvaluationCriteriaDTO> updateCriteria(
            @PathVariable Long id,
            @RequestBody EvaluationCriteriaDTO dto) {
        try {
            EvaluationCriteriaDTO updatedCriteria = service.updateCriteria(id, dto);
            return ResponseEntity.ok(updatedCriteria);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCriteria(@PathVariable Long id) {
        try {
            service.deleteCriteria(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 가중치 수정
    @PatchMapping("/{id}/weight")
    public ResponseEntity<EvaluationCriteriaDTO> updateWeight(
            @PathVariable Long id,
            @RequestParam Integer weight) {
        try {
            EvaluationCriteriaDTO updatedCriteria = service.updateWeight(id, weight);
            return ResponseEntity.ok(updatedCriteria);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}