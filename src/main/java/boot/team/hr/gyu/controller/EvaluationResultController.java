package boot.team.hr.gyu.controller;

import boot.team.hr.gyu.dto.EvaluationResultDTO;
import boot.team.hr.gyu.service.EvaluationResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/evaluation/results")
public class EvaluationResultController {

    private final EvaluationResultService resultService;

    /**
     * 현재 로그인한 사용자의 평가 결과 조회
     */
    @GetMapping("/my-evaluations")
    public ResponseEntity<List<EvaluationResultDTO>> getMyEvaluations(Authentication authentication) {
        String email = authentication.getName();
        List<EvaluationResultDTO> results = resultService.getMyEvaluations(email);
        return ResponseEntity.ok(results);
    }

    /**
     * 특정 직원의 평가 결과 목록 조회
     */
    @GetMapping("/employee/{empId}")
    public ResponseEntity<List<EvaluationResultDTO>> getEvaluationsByEmpId(@PathVariable String empId) {
        List<EvaluationResultDTO> results = resultService.getEvaluationsByEmpId(empId);
        return ResponseEntity.ok(results);
    }

    /**
     * 특정 평가 결과 상세 조회
     */
    @GetMapping("/{evaluationId}")
    public ResponseEntity<EvaluationResultDTO> getEvaluationById(@PathVariable Long evaluationId) {
        EvaluationResultDTO result = resultService.getEvaluationById(evaluationId);
        return ResponseEntity.ok(result);
    }

    /**
     * 특정 기간의 평가 결과 목록 조회
     */
    @GetMapping("/period/{period}")
    public ResponseEntity<List<EvaluationResultDTO>> getEvaluationsByPeriod(@PathVariable String period) {
        List<EvaluationResultDTO> results = resultService.getEvaluationsByPeriod(period);
        return ResponseEntity.ok(results);
    }
}