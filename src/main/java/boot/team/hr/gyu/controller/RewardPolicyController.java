package boot.team.hr.gyu.controller;

import boot.team.hr.gyu.dto.RewardPolicyDTO;
import boot.team.hr.gyu.service.RewardPolicyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reward/policy")
@CrossOrigin(origins = "*")
public class RewardPolicyController {

    private final RewardPolicyService service;

    @Autowired
    public RewardPolicyController(RewardPolicyService service) {
        this.service = service;
    }

    // 전체 조회
    @GetMapping
    public ResponseEntity<List<RewardPolicyDTO>> getAllPolicies() {
        try {
            List<RewardPolicyDTO> policies = service.getAllPolicies();
            return ResponseEntity.ok(policies);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ID로 조회
    @GetMapping("/{id}")
    public ResponseEntity<RewardPolicyDTO> getPolicyById(@PathVariable Long id) {
        try {
            RewardPolicyDTO policy = service.getPolicyById(id);
            return ResponseEntity.ok(policy);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 활성화된 정책만 조회
    @GetMapping("/active")
    public ResponseEntity<List<RewardPolicyDTO>> getActivePolicies() {
        try {
            List<RewardPolicyDTO> policies = service.getActivePolicies();
            return ResponseEntity.ok(policies);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 생성
    @PostMapping
    public ResponseEntity<RewardPolicyDTO> createPolicy(@RequestBody RewardPolicyDTO dto) {
        try {
            RewardPolicyDTO createdPolicy = service.createPolicy(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdPolicy);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 수정
    @PutMapping("/{id}")
    public ResponseEntity<RewardPolicyDTO> updatePolicy(
            @PathVariable Long id,
            @RequestBody RewardPolicyDTO dto) {
        try {
            RewardPolicyDTO updatedPolicy = service.updatePolicy(id, dto);
            return ResponseEntity.ok(updatedPolicy);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePolicy(@PathVariable Long id) {
        try {
            service.deletePolicy(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 활성화 상태 토글
    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<RewardPolicyDTO> toggleActiveStatus(@PathVariable Long id) {
        try {
            RewardPolicyDTO updatedPolicy = service.toggleActiveStatus(id);
            return ResponseEntity.ok(updatedPolicy);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}