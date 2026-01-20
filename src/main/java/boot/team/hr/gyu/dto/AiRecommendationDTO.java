package boot.team.hr.gyu.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiRecommendationDTO {

    // 직원 정보
    private String empId;
    private String empName;
    private String empRole;
    private String deptName;

    // 평가 정보
    private Double avgScore;
    private List<String> comments;
    private String latestComment;

    // AI 추천 결과
    private List<RecommendedReward> recommendedRewards;
    private String newRewardSuggestion;
    private String overallRecommendReason;

    // 추천 점수 (내부 계산용)
    private Double recommendationScore;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecommendedReward {
        private Long policyId;
        private String policyName;
        private String rewardType;
        private String matchReason;
        private Integer matchScore;  // 매칭 점수 (0-100)
        private List<String> matchedKeywords;
    }
}