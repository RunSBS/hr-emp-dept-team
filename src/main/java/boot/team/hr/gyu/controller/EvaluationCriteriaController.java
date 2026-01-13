package boot.team.hr.gyu.controller;

import boot.team.hr.gyu.dto.CurrentUserDTO;
import boot.team.hr.gyu.dto.EvaluationCriteriaDTO;
import boot.team.hr.gyu.service.EvaluationCriteriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/evaluation/criteria")
public class EvaluationCriteriaController {

    private final EvaluationCriteriaService criteriaService;

    /**
     * 현재 로그인 사용자 정보 조회
     */
    @GetMapping("/current-user")
    public ResponseEntity<CurrentUserDTO> getCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            System.out.println("[평가항목관리] 인증 정보 없음");
            return ResponseEntity.status(401).build();
        }

        String email = authentication.getName();
        CurrentUserDTO currentUser = criteriaService.getCurrentUser(email);
        return ResponseEntity.ok(currentUser);
    }

    @GetMapping
    public ResponseEntity<List<EvaluationCriteriaDTO>> getAllCriteria() {
        List<EvaluationCriteriaDTO> criteria = criteriaService.getAllCriteria();
        return ResponseEntity.ok(criteria);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EvaluationCriteriaDTO> getCriteriaById(@PathVariable Long id) {
        EvaluationCriteriaDTO criteria = criteriaService.getCriteriaById(id);
        return ResponseEntity.ok(criteria);
    }

    @PostMapping
    public ResponseEntity<Long> createCriteria(Authentication authentication, @RequestBody EvaluationCriteriaDTO dto) {
        if (authentication == null || authentication.getName() == null) {
            System.out.println("[평가항목관리] 평가 항목 생성 실패 - 인증 정보 없음");
            return ResponseEntity.status(401).build();
        }

        String email = authentication.getName();
        if (!criteriaService.hasManagementPermission(email)) {
            System.out.println("[평가항목관리] 평가 항목 생성 실패 - 권한 없음 (이메일: " + email + ")");
            return ResponseEntity.status(403).build();
        }

        System.out.println("[평가항목관리] 평가 항목 생성 - 사용자: " + email);
        Long id = criteriaService.createCriteria(dto);
        return ResponseEntity.ok(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateCriteria(Authentication authentication, @PathVariable Long id, @RequestBody EvaluationCriteriaDTO dto) {
        if (authentication == null || authentication.getName() == null) {
            System.out.println("[평가항목관리] 평가 항목 수정 실패 - 인증 정보 없음");
            return ResponseEntity.status(401).build();
        }

        String email = authentication.getName();
        if (!criteriaService.hasManagementPermission(email)) {
            System.out.println("[평가항목관리] 평가 항목 수정 실패 - 권한 없음 (이메일: " + email + ")");
            return ResponseEntity.status(403).build();
        }

        System.out.println("[평가항목관리] 평가 항목 수정 - ID: " + id + ", 사용자: " + email);
        criteriaService.updateCriteria(id, dto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCriteria(Authentication authentication, @PathVariable Long id) {
        if (authentication == null || authentication.getName() == null) {
            System.out.println("[평가항목관리] 평가 항목 삭제 실패 - 인증 정보 없음");
            return ResponseEntity.status(401).build();
        }

        String email = authentication.getName();
        if (!criteriaService.hasManagementPermission(email)) {
            System.out.println("[평가항목관리] 평가 항목 삭제 실패 - 권한 없음 (이메일: " + email + ")");
            return ResponseEntity.status(403).build();
        }

        System.out.println("[평가항목관리] 평가 항목 삭제 - ID: " + id + ", 사용자: " + email);
        criteriaService.deleteCriteria(id);
        return ResponseEntity.ok().build();
    }
}