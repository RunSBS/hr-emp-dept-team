package boot.team.hr.gyu.controller;

import boot.team.hr.gyu.dto.CurrentUserDTO;
import boot.team.hr.gyu.dto.RewardPolicyDTO;
import boot.team.hr.gyu.service.RewardPolicyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reward/policy")
public class RewardPolicyController {

    private final RewardPolicyService policyService;

    /**
     * 현재 로그인 사용자 정보 조회
     */
    @GetMapping("/current-user")
    public ResponseEntity<CurrentUserDTO> getCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            System.out.println("[포상정책관리] 인증 정보 없음");
            return ResponseEntity.status(401).build();
        }

        String email = authentication.getName();
        CurrentUserDTO currentUser = policyService.getCurrentUser(email);
        return ResponseEntity.ok(currentUser);
    }

    @GetMapping
    public ResponseEntity<List<RewardPolicyDTO>> getAllPolicies() {
        List<RewardPolicyDTO> policies = policyService.getAllPolicies();
        return ResponseEntity.ok(policies);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RewardPolicyDTO> getPolicyById(@PathVariable Long id) {
        RewardPolicyDTO policy = policyService.getPolicyById(id);
        return ResponseEntity.ok(policy);
    }

    @PostMapping
    public ResponseEntity<Long> createPolicy(Authentication authentication, @RequestBody RewardPolicyDTO dto) {
        if (authentication == null || authentication.getName() == null) {
            System.out.println("[포상정책관리] 포상 정책 생성 실패 - 인증 정보 없음");
            return ResponseEntity.status(401).build();
        }

        String email = authentication.getName();
        if (!policyService.hasManagementPermission(email)) {
            System.out.println("[포상정책관리] 포상 정책 생성 실패 - 권한 없음 (이메일: " + email + ")");
            return ResponseEntity.status(403).build();
        }

        System.out.println("[포상정책관리] 포상 정책 생성 - 사용자: " + email);
        Long id = policyService.createPolicy(dto);
        return ResponseEntity.ok(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updatePolicy(Authentication authentication, @PathVariable Long id, @RequestBody RewardPolicyDTO dto) {
        if (authentication == null || authentication.getName() == null) {
            System.out.println("[포상정책관리] 포상 정책 수정 실패 - 인증 정보 없음");
            return ResponseEntity.status(401).build();
        }

        String email = authentication.getName();
        if (!policyService.hasManagementPermission(email)) {
            System.out.println("[포상정책관리] 포상 정책 수정 실패 - 권한 없음 (이메일: " + email + ")");
            return ResponseEntity.status(403).build();
        }

        System.out.println("[포상정책관리] 포상 정책 수정 - ID: " + id + ", 사용자: " + email);
        policyService.updatePolicy(id, dto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePolicy(Authentication authentication, @PathVariable Long id) {
        if (authentication == null || authentication.getName() == null) {
            System.out.println("[포상정책관리] 포상 정책 삭제 실패 - 인증 정보 없음");
            return ResponseEntity.status(401).build();
        }

        String email = authentication.getName();
        if (!policyService.hasManagementPermission(email)) {
            System.out.println("[포상정책관리] 포상 정책 삭제 실패 - 권한 없음 (이메일: " + email + ")");
            return ResponseEntity.status(403).build();
        }

        System.out.println("[포상정책관리] 포상 정책 삭제 - ID: " + id + ", 사용자: " + email);
        policyService.deletePolicy(id);
        return ResponseEntity.ok().build();
    }
}