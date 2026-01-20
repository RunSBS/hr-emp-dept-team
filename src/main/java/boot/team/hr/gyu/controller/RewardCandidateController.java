package boot.team.hr.gyu.controller;

import boot.team.hr.gyu.dto.AiRecommendationDTO;
import boot.team.hr.gyu.dto.CurrentUserDTO;
import boot.team.hr.gyu.dto.NomineeDTO;
import boot.team.hr.gyu.dto.RewardCandidateDTO;
import boot.team.hr.gyu.service.AiRecommendationService;
import boot.team.hr.gyu.service.RewardCandidateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reward/candidate")
public class RewardCandidateController {

    private final RewardCandidateService candidateService;
    private final AiRecommendationService aiRecommendationService;

    /**
     * 현재 로그인 사용자 정보 조회
     */
    @GetMapping("/current-user")
    public ResponseEntity<CurrentUserDTO> getCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            System.out.println("[포상 추천] 인증 정보 없음");
            return ResponseEntity.status(401).build();
        }

        String email = authentication.getName();
        CurrentUserDTO currentUser = candidateService.getCurrentUser(email);
        return ResponseEntity.ok(currentUser);
    }

    /**
     * 추천 권한 체크
     */
    @GetMapping("/permission")
    public ResponseEntity<Boolean> checkPermission(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).build();
        }

        String email = authentication.getName();
        boolean hasPermission = candidateService.hasNominationPermission(email);
        return ResponseEntity.ok(hasPermission);
    }

    /**
     * 추천 가능한 사원 목록 조회
     */
    @GetMapping("/nominees")
    public ResponseEntity<List<NomineeDTO>> getNominees(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            System.out.println("[포상 추천] 추천 가능 사원 조회 실패 - 인증 정보 없음");
            return ResponseEntity.status(401).build();
        }

        String email = authentication.getName();
        if (!candidateService.hasNominationPermission(email)) {
            System.out.println("[포상 추천] 추천 가능 사원 조회 실패 - 권한 없음");
            return ResponseEntity.status(403).build();
        }

        List<NomineeDTO> nominees = candidateService.getNominees(email);
        return ResponseEntity.ok(nominees);
    }

    /**
     * 포상 후보 추천 등록
     */
    @PostMapping
    public ResponseEntity<Long> nominateCandidate(Authentication authentication, @RequestBody RewardCandidateDTO dto) {
        if (authentication == null || authentication.getName() == null) {
            System.out.println("[포상 추천] 추천 등록 실패 - 인증 정보 없음");
            return ResponseEntity.status(401).build();
        }

        String email = authentication.getName();
        if (!candidateService.hasNominationPermission(email)) {
            System.out.println("[포상 추천] 추천 등록 실패 - 권한 없음");
            return ResponseEntity.status(403).build();
        }

        try {
            Long candidateId = candidateService.nominateCandidate(email, dto);
            return ResponseEntity.ok(candidateId);
        } catch (IllegalArgumentException e) {
            System.out.println("[포상 추천] 추천 등록 실패 - " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 내가 추천한 후보 목록 조회
     */
    @GetMapping("/my-nominations")
    public ResponseEntity<List<RewardCandidateDTO>> getMyNominations(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            System.out.println("[포상 추천] 내 추천 목록 조회 실패 - 인증 정보 없음");
            return ResponseEntity.status(401).build();
        }

        String email = authentication.getName();
        CurrentUserDTO currentUser = candidateService.getCurrentUser(email);
        List<RewardCandidateDTO> candidates = candidateService.getCandidatesByNominator(currentUser.getEmpId());
        return ResponseEntity.ok(candidates);
    }

    /**
     * 전체 추천 목록 조회 (관리자용)
     */
    @GetMapping("/all")
    public ResponseEntity<List<RewardCandidateDTO>> getAllCandidates(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            System.out.println("[포상 추천] 전체 추천 목록 조회 실패 - 인증 정보 없음");
            return ResponseEntity.status(401).build();
        }

        List<RewardCandidateDTO> candidates = candidateService.getAllCandidates();
        return ResponseEntity.ok(candidates);
    }

    /**
     * 본인의 승인된 포상 이력 조회
     */
    @GetMapping("/my-rewards")
    public ResponseEntity<List<RewardCandidateDTO>> getMyApprovedRewards(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            System.out.println("[포상 이력] 본인 포상 이력 조회 실패 - 인증 정보 없음");
            return ResponseEntity.status(401).build();
        }

        String email = authentication.getName();
        List<RewardCandidateDTO> rewards = candidateService.getMyApprovedRewards(email);
        return ResponseEntity.ok(rewards);
    }

    // ==================== AI 추천 API ====================

    /**
     * AI 추천 후보 목록 조회
     */
    @GetMapping("/ai-recommendations")
    public ResponseEntity<List<AiRecommendationDTO>> getAiRecommendations(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            System.out.println("[AI 추천] 조회 실패 - 인증 정보 없음");
            return ResponseEntity.status(401).build();
        }

        String email = authentication.getName();
        if (!candidateService.hasNominationPermission(email)) {
            System.out.println("[AI 추천] 조회 실패 - 권한 없음");
            return ResponseEntity.status(403).build();
        }

        try {
            List<AiRecommendationDTO> recommendations = aiRecommendationService.getAiRecommendations(email);
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            System.out.println("[AI 추천] 조회 실패 - " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 특정 직원 AI 추천 상세 조회
     */
    @GetMapping("/ai-recommendations/{empId}")
    public ResponseEntity<AiRecommendationDTO> getRecommendationForEmployee(
            Authentication authentication,
            @PathVariable String empId) {
        if (authentication == null || authentication.getName() == null) {
            System.out.println("[AI 추천] 상세 조회 실패 - 인증 정보 없음");
            return ResponseEntity.status(401).build();
        }

        String email = authentication.getName();
        if (!candidateService.hasNominationPermission(email)) {
            System.out.println("[AI 추천] 상세 조회 실패 - 권한 없음");
            return ResponseEntity.status(403).build();
        }

        try {
            AiRecommendationDTO recommendation = aiRecommendationService.getRecommendationForEmployee(empId);
            if (recommendation == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(recommendation);
        } catch (Exception e) {
            System.out.println("[AI 추천] 상세 조회 실패 - " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * AI 추천 기반 포상 후보 등록
     */
    @PostMapping("/ai-nominate")
    public ResponseEntity<Long> nominateFromAi(
            Authentication authentication,
            @RequestBody Map<String, Object> request) {
        if (authentication == null || authentication.getName() == null) {
            System.out.println("[AI 추천] 등록 실패 - 인증 정보 없음");
            return ResponseEntity.status(401).build();
        }

        String email = authentication.getName();
        if (!candidateService.hasNominationPermission(email)) {
            System.out.println("[AI 추천] 등록 실패 - 권한 없음");
            return ResponseEntity.status(403).build();
        }

        try {
            String nomineeId = (String) request.get("nomineeId");
            Long policyId = Long.valueOf(request.get("policyId").toString());
            Long rewardAmount = Long.valueOf(request.get("rewardAmount").toString());
            String reason = (String) request.get("reason");

            Long candidateId = aiRecommendationService.nominateFromAiRecommendation(
                    email, nomineeId, policyId, rewardAmount, reason);
            return ResponseEntity.ok(candidateId);
        } catch (Exception e) {
            System.out.println("[AI 추천] 등록 실패 - " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}