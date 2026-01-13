package boot.team.hr.gyu.controller;

import boot.team.hr.gyu.dto.RewardPolicyDTO;
import boot.team.hr.gyu.service.RewardPolicyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reward/policy")
public class RewardPolicyController {

    private final RewardPolicyService policyService;

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
    public ResponseEntity<Long> createPolicy(@RequestBody RewardPolicyDTO dto) {
        Long id = policyService.createPolicy(dto);
        return ResponseEntity.ok(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updatePolicy(@PathVariable Long id, @RequestBody RewardPolicyDTO dto) {
        policyService.updatePolicy(id, dto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePolicy(@PathVariable Long id) {
        policyService.deletePolicy(id);
        return ResponseEntity.ok().build();
    }
}