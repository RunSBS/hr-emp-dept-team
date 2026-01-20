package boot.team.hr.gyu.service;

import boot.team.hr.gyu.dto.AiRecommendationDTO;
import boot.team.hr.gyu.dto.AiRecommendationDTO.RecommendedReward;
import boot.team.hr.gyu.dto.RewardCandidateDTO;
import boot.team.hr.gyu.entity.EvaluationResult;
import boot.team.hr.gyu.entity.RewardCandidate;
import boot.team.hr.gyu.entity.RewardPolicy;
import boot.team.hr.gyu.repository.EvaluationResultRepository;
import boot.team.hr.gyu.repository.RewardCandidateRepository;
import boot.team.hr.gyu.repository.RewardPolicyRepository;
import boot.team.hr.hyun.emp.entity.Emp;
import boot.team.hr.hyun.emp.repo.EmpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiRecommendationService {

    private final EvaluationResultRepository evaluationResultRepository;
    private final RewardPolicyRepository rewardPolicyRepository;
    private final RewardCandidateRepository rewardCandidateRepository;
    private final EmpRepository empRepository;
    private final OpenAiService openAiService;

    // 키워드-포상 매핑
    private static final Map<String, List<String>> KEYWORD_MAPPING = new HashMap<>();

    static {
        KEYWORD_MAPPING.put("프로젝트 MVP", Arrays.asList("프로젝트", "기여도", "성과", "완료", "목표달성", "주도", "핵심"));
        KEYWORD_MAPPING.put("팀워크상", Arrays.asList("팀원", "협업", "지원", "소통", "조화", "배려", "도움"));
        KEYWORD_MAPPING.put("기술 제안 채택", Arrays.asList("기술", "개선", "제안", "혁신", "효율", "자동화", "최적화"));
        KEYWORD_MAPPING.put("리더십상", Arrays.asList("리더십", "관리", "이끌", "조직", "방향", "멘토", "지도"));
        KEYWORD_MAPPING.put("고객만족상", Arrays.asList("고객", "서비스", "만족", "응대", "해결", "친절", "신속"));
        KEYWORD_MAPPING.put("분기 우수사원", Arrays.asList("우수", "뛰어남", "탁월", "모범", "최고", "훌륭", "인정"));
        KEYWORD_MAPPING.put("장기 근속 포상", Arrays.asList("근속", "헌신", "충성", "오랜", "꾸준", "성실"));
    }

    /**
     * 추천 가능한 직원들의 AI 추천 목록 생성
     */
    @Transactional(readOnly = true)
    public List<AiRecommendationDTO> getAiRecommendations(String nominatorEmail) {
        Emp nominator = empRepository.findByEmail(nominatorEmail)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 추천 가능한 직원 목록 조회
        List<Emp> nominees = getNomineesForAi(nominator);

        // 활성화된 포상 정책 조회
        List<RewardPolicy> activePolicies = rewardPolicyRepository.findAll().stream()
                .filter(p -> "Y".equals(p.getIsActive()))
                .collect(Collectors.toList());

        List<AiRecommendationDTO> recommendations = new ArrayList<>();

        for (Emp nominee : nominees) {
            AiRecommendationDTO recommendation = generateRecommendation(nominee, activePolicies);
            if (recommendation != null && !recommendation.getRecommendedRewards().isEmpty()) {
                recommendations.add(recommendation);
            }
        }

        // 추천 점수 순으로 정렬
        recommendations.sort((a, b) -> Double.compare(b.getRecommendationScore(), a.getRecommendationScore()));

        System.out.println("[AI 추천] 총 " + recommendations.size() + "명의 추천 후보 생성 완료");

        return recommendations;
    }

    /**
     * 특정 직원에 대한 AI 추천 상세
     */
    @Transactional(readOnly = true)
    public AiRecommendationDTO getRecommendationForEmployee(String empId) {
        Emp emp = empRepository.findById(empId)
                .orElseThrow(() -> new IllegalArgumentException("직원을 찾을 수 없습니다."));

        List<RewardPolicy> activePolicies = rewardPolicyRepository.findAll().stream()
                .filter(p -> "Y".equals(p.getIsActive()))
                .collect(Collectors.toList());

        return generateRecommendation(emp, activePolicies);
    }

    /**
     * AI 추천 기반 포상 후보 등록
     */
    @Transactional
    public Long nominateFromAiRecommendation(String nominatorEmail, String nomineeId, Long policyId, Long rewardAmount, String reason) {
        Emp nominator = empRepository.findByEmail(nominatorEmail)
                .orElseThrow(() -> new IllegalArgumentException("추천자를 찾을 수 없습니다."));

        Emp nominee = empRepository.findById(nomineeId)
                .orElseThrow(() -> new IllegalArgumentException("피추천자를 찾을 수 없습니다."));

        RewardPolicy policy = rewardPolicyRepository.findById(policyId)
                .orElseThrow(() -> new IllegalArgumentException("포상 정책을 찾을 수 없습니다."));

        if (!"Y".equals(policy.getIsActive())) {
            throw new IllegalArgumentException("활성화되지 않은 포상 정책입니다.");
        }

        RewardCandidate candidate = RewardCandidate.builder()
                .policyId(policyId)
                .nominatorId(nominator.getEmpId())
                .nomineeId(nomineeId)
                .nominationType("AI")
                .reason(reason)
                .rewardAmount(rewardAmount)
                .status("PENDING")
                .build();

        RewardCandidate saved = rewardCandidateRepository.save(candidate);

        System.out.println("[AI 추천] AI 기반 추천 등록 완료 - 추천자: " + nominator.getEmpName() +
                ", 피추천자: " + nominee.getEmpName() + ", 포상: " + policy.getPolicyName());

        return saved.getCandidateId();
    }

    /**
     * 개별 직원에 대한 추천 생성
     */
    private AiRecommendationDTO generateRecommendation(Emp emp, List<RewardPolicy> policies) {
        // 평가 결과 조회
        List<EvaluationResult> evaluations = evaluationResultRepository.findByEmpIdOrderByCreatedAtDesc(emp.getEmpId());

        if (evaluations.isEmpty()) {
            return null;
        }

        // 평균 점수 계산
        double avgScore = evaluations.stream()
                .filter(e -> e.getTotalScore() != null)
                .mapToInt(EvaluationResult::getTotalScore)
                .average()
                .orElse(0.0);

        // 코멘트 수집
        List<String> comments = evaluations.stream()
                .map(EvaluationResult::getComment)
                .filter(c -> c != null && !c.trim().isEmpty())
                .collect(Collectors.toList());

        String latestComment = comments.isEmpty() ? "" : comments.get(0);
        String allComments = String.join(" ", comments);

        // 포상 정책 이름 목록
        List<String> policyNames = policies.stream()
                .map(RewardPolicy::getPolicyName)
                .collect(Collectors.toList());

        // OpenAI 사용 가능 여부 확인 후 분기
        if (openAiService.isAvailable()) {
            return generateWithOpenAI(emp, avgScore, comments, latestComment, policies, policyNames);
        } else {
            return generateWithRules(emp, avgScore, comments, latestComment, allComments, policies);
        }
    }

    /**
     * OpenAI를 사용한 추천 생성
     */
    private AiRecommendationDTO generateWithOpenAI(Emp emp, double avgScore, List<String> comments,
                                                    String latestComment, List<RewardPolicy> policies,
                                                    List<String> policyNames) {
        System.out.println("[AI 추천] OpenAI API 사용 - 직원: " + emp.getEmpName());

        // OpenAI API 호출
        OpenAiService.OpenAiRecommendationResult aiResult =
                openAiService.analyzeForReward(emp.getEmpName(), avgScore, comments, policyNames);

        if (aiResult == null) {
            // OpenAI 실패 시 Rule-based로 fallback
            System.out.println("[AI 추천] OpenAI 실패, Rule-based로 전환");
            String allComments = String.join(" ", comments);
            return generateWithRules(emp, avgScore, comments, latestComment, allComments, policies);
        }

        // OpenAI 결과를 DTO로 변환
        List<RecommendedReward> recommendedRewards = new ArrayList<>();

        for (OpenAiService.OpenAiRewardRecommendation aiRec : aiResult.getRecommendedRewards()) {
            // 포상 정책 찾기
            RewardPolicy matchedPolicy = policies.stream()
                    .filter(p -> p.getPolicyName().equals(aiRec.getRewardName()))
                    .findFirst()
                    .orElse(null);

            if (matchedPolicy != null) {
                RecommendedReward reward = RecommendedReward.builder()
                        .policyId(matchedPolicy.getPolicyId())
                        .policyName(matchedPolicy.getPolicyName())
                        .rewardType(matchedPolicy.getRewardType())
                        .matchScore(aiRec.getMatchScore())
                        .matchReason(aiRec.getReason())
                        .matchedKeywords(Collections.emptyList())
                        .build();
                recommendedRewards.add(reward);
            }
        }

        // 추천 점수 계산
        double recommendationScore = calculateRecommendationScore(avgScore, recommendedRewards);

        return AiRecommendationDTO.builder()
                .empId(emp.getEmpId())
                .empName(emp.getEmpName())
                .empRole(emp.getEmpRole())
                .deptName(emp.getDept() != null ? emp.getDept().getDeptName() : null)
                .avgScore(Math.round(avgScore * 10) / 10.0)
                .comments(comments)
                .latestComment(latestComment)
                .recommendedRewards(recommendedRewards)
                .newRewardSuggestion(aiResult.getNewRewardSuggestion())
                .overallRecommendReason(aiResult.getOverallAnalysis())
                .recommendationScore(recommendationScore)
                .build();
    }

    /**
     * Rule-based 추천 생성 (기존 로직)
     */
    private AiRecommendationDTO generateWithRules(Emp emp, double avgScore, List<String> comments,
                                                   String latestComment, String allComments,
                                                   List<RewardPolicy> policies) {
        System.out.println("[AI 추천] Rule-based 사용 - 직원: " + emp.getEmpName());

        // 추천 포상 생성
        List<RecommendedReward> recommendedRewards = new ArrayList<>();

        for (RewardPolicy policy : policies) {
            RecommendedReward reward = matchPolicyWithEmployee(policy, avgScore, allComments);
            if (reward != null && reward.getMatchScore() >= 50) {
                recommendedRewards.add(reward);
            }
        }

        // 매칭 점수 순으로 정렬
        recommendedRewards.sort((a, b) -> Integer.compare(b.getMatchScore(), a.getMatchScore()));

        // 상위 3개만 추천
        if (recommendedRewards.size() > 3) {
            recommendedRewards = recommendedRewards.subList(0, 3);
        }

        // 새로운 포상 제안 (조건 충족시)
        String newRewardSuggestion = generateNewRewardSuggestion(avgScore, allComments);

        // 전체 추천 사유 생성
        String overallReason = generateOverallReason(avgScore, comments, recommendedRewards);

        // 추천 점수 계산
        double recommendationScore = calculateRecommendationScore(avgScore, recommendedRewards);

        return AiRecommendationDTO.builder()
                .empId(emp.getEmpId())
                .empName(emp.getEmpName())
                .empRole(emp.getEmpRole())
                .deptName(emp.getDept() != null ? emp.getDept().getDeptName() : null)
                .avgScore(Math.round(avgScore * 10) / 10.0)
                .comments(comments)
                .latestComment(latestComment)
                .recommendedRewards(recommendedRewards)
                .newRewardSuggestion(newRewardSuggestion)
                .overallRecommendReason(overallReason)
                .recommendationScore(recommendationScore)
                .build();
    }

    /**
     * 정책과 직원 매칭
     */
    private RecommendedReward matchPolicyWithEmployee(RewardPolicy policy, double avgScore, String comments) {
        String policyName = policy.getPolicyName();
        List<String> keywords = KEYWORD_MAPPING.getOrDefault(policyName, Collections.emptyList());

        // 키워드 매칭
        List<String> matchedKeywords = new ArrayList<>();
        for (String keyword : keywords) {
            if (comments.contains(keyword)) {
                matchedKeywords.add(keyword);
            }
        }

        // 점수 기반 매칭
        int scoreBonus = 0;
        if (avgScore >= 90) {
            scoreBonus = 30;
        } else if (avgScore >= 85) {
            scoreBonus = 20;
        } else if (avgScore >= 80) {
            scoreBonus = 10;
        }

        // 특정 포상별 점수 조건
        if (policyName.contains("우수사원") || policyName.contains("MVP")) {
            if (avgScore < 85) {
                scoreBonus = 0;
            }
        }

        // 키워드 매칭 점수
        int keywordScore = keywords.isEmpty() ? 50 : (int) ((double) matchedKeywords.size() / keywords.size() * 70);

        // 총 매칭 점수
        int totalScore = Math.min(100, keywordScore + scoreBonus);

        if (totalScore < 30) {
            return null;
        }

        // 매칭 사유 생성
        String matchReason = generateMatchReason(policyName, avgScore, matchedKeywords);

        return RecommendedReward.builder()
                .policyId(policy.getPolicyId())
                .policyName(policy.getPolicyName())
                .rewardType(policy.getRewardType())
                .matchScore(totalScore)
                .matchedKeywords(matchedKeywords)
                .matchReason(matchReason)
                .build();
    }

    /**
     * 매칭 사유 생성
     */
    private String generateMatchReason(String policyName, double avgScore, List<String> matchedKeywords) {
        StringBuilder reason = new StringBuilder();

        if (avgScore >= 90) {
            reason.append("평가 점수 우수(").append(String.format("%.1f", avgScore)).append("점). ");
        } else if (avgScore >= 85) {
            reason.append("평가 점수 양호(").append(String.format("%.1f", avgScore)).append("점). ");
        }

        if (!matchedKeywords.isEmpty()) {
            reason.append("평가 코멘트에서 '").append(String.join("', '", matchedKeywords)).append("' 키워드 발견.");
        }

        return reason.toString().trim();
    }

    /**
     * 새로운 포상 제안 생성
     */
    private String generateNewRewardSuggestion(double avgScore, String comments) {
        // 특수 조건 확인
        if (avgScore >= 95) {
            if (comments.contains("특허") || comments.contains("수상") || comments.contains("대외")) {
                return "특별 공로상 - 탁월한 성과와 대외 기여도를 인정하여 특별 포상을 제안합니다.";
            }
            return "종합 우수사원상 - 모든 영역에서 뛰어난 성과를 보여 종합 포상을 제안합니다.";
        }

        if (comments.contains("특허")) {
            return "기술 혁신상 - 특허 출원/등록 기여를 인정하여 신규 포상을 제안합니다.";
        }

        return null;
    }

    /**
     * 전체 추천 사유 생성
     */
    private String generateOverallReason(double avgScore, List<String> comments, List<RecommendedReward> rewards) {
        StringBuilder reason = new StringBuilder();

        reason.append("평균 평가 점수 ").append(String.format("%.1f", avgScore)).append("점");

        if (avgScore >= 90) {
            reason.append("으로 상위 우수 등급에 해당합니다. ");
        } else if (avgScore >= 85) {
            reason.append("으로 우수 등급에 해당합니다. ");
        } else {
            reason.append("입니다. ");
        }

        if (!comments.isEmpty()) {
            reason.append("평가자 코멘트 분석 결과, ");

            Set<String> allKeywords = new HashSet<>();
            for (RecommendedReward reward : rewards) {
                if (reward.getMatchedKeywords() != null) {
                    allKeywords.addAll(reward.getMatchedKeywords());
                }
            }

            if (!allKeywords.isEmpty()) {
                reason.append("'").append(String.join("', '", allKeywords)).append("' 등의 긍정적 평가가 확인되었습니다.");
            } else {
                reason.append("전반적으로 긍정적인 평가를 받았습니다.");
            }
        }

        return reason.toString();
    }

    /**
     * 추천 점수 계산
     */
    private double calculateRecommendationScore(double avgScore, List<RecommendedReward> rewards) {
        double scoreWeight = avgScore * 0.6;

        double rewardScore = rewards.isEmpty() ? 0 :
                rewards.stream().mapToInt(RecommendedReward::getMatchScore).average().orElse(0);
        double rewardWeight = rewardScore * 0.4;

        return scoreWeight + rewardWeight;
    }

    /**
     * 추천 가능한 직원 목록 조회 (CEO: 리더들, LEADER: 팀원들)
     */
    private List<Emp> getNomineesForAi(Emp nominator) {
        String empRole = nominator.getEmpRole();

        if ("CEO".equals(empRole)) {
            return empRepository.findAll().stream()
                    .filter(emp -> "LEADER".equals(emp.getEmpRole()))
                    .collect(Collectors.toList());
        } else if ("LEADER".equals(empRole)) {
            Integer deptNo = nominator.getDept() != null ? nominator.getDept().getDeptNo() : null;
            if (deptNo == null) {
                return Collections.emptyList();
            }

            return empRepository.findAll().stream()
                    .filter(emp -> emp.getDept() != null && deptNo.equals(emp.getDept().getDeptNo()))
                    .filter(emp -> !"LEADER".equals(emp.getEmpRole()) && !"CEO".equals(emp.getEmpRole()))
                    .filter(emp -> !emp.getEmpId().equals(nominator.getEmpId()))
                    .collect(Collectors.toList());
        }

        return Collections.emptyList();
    }
}