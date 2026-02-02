package boot.team.hr.gyu.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PythonRecommendResponse {

    private List<PythonRecommendation> recommendations;
    private List<String> extractedKeywords;
    private String overallSentiment;
    private String status;
    private String error;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PythonRecommendation {
        private Long policyId;
        private String policyName;
        private Integer matchScore;
        private Double similarityScore;
        private String reason;
        private List<String> keywords;
    }
}