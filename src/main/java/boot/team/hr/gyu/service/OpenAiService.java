package boot.team.hr.gyu.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Service
public class OpenAiService {

    @Value("${ai.openai.enabled:false}")
    private boolean enabled;

    @Value("${ai.openai.api-key:}")
    private String apiKey;

    @Value("${ai.openai.model:gpt-4o-mini}")
    private String model;

    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public OpenAiService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * OpenAI 사용 가능 여부 확인
     */
    public boolean isAvailable() {
        return enabled && apiKey != null && !apiKey.isEmpty() && !apiKey.equals("YOUR_API_KEY_HERE");
    }

    /**
     * 포상 추천 분석 요청
     */
    public OpenAiRecommendationResult analyzeForReward(String empName, double avgScore, List<String> comments, List<String> availableRewards) {
        if (!isAvailable()) {
            log.warn("[OpenAI] API가 비활성화되어 있거나 API 키가 없습니다.");
            return null;
        }

        try {
            String prompt = buildPrompt(empName, avgScore, comments, availableRewards);
            String response = callOpenAiApi(prompt);
            return parseResponse(response);
        } catch (Exception e) {
            log.error("[OpenAI] API 호출 실패: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 프롬프트 생성
     */
    private String buildPrompt(String empName, double avgScore, List<String> comments, List<String> availableRewards) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("당신은 HR 포상 추천 전문가입니다. 아래 직원 정보를 분석하여 적합한 포상을 추천해주세요.\n\n");

        prompt.append("## 직원 정보\n");
        prompt.append("- 이름: ").append(empName).append("\n");
        prompt.append("- 평균 평가 점수: ").append(String.format("%.1f", avgScore)).append("점\n");
        prompt.append("- 평가 코멘트:\n");
        for (String comment : comments) {
            if (comment != null && !comment.trim().isEmpty()) {
                prompt.append("  - \"").append(comment).append("\"\n");
            }
        }

        prompt.append("\n## 선택 가능한 포상 항목\n");
        for (int i = 0; i < availableRewards.size(); i++) {
            prompt.append((i + 1)).append(". ").append(availableRewards.get(i)).append("\n");
        }

        prompt.append("\n## 응답 형식 (반드시 JSON으로만 응답)\n");
        prompt.append("```json\n");
        prompt.append("{\n");
        prompt.append("  \"recommendedRewards\": [\n");
        prompt.append("    {\n");
        prompt.append("      \"rewardName\": \"포상명\",\n");
        prompt.append("      \"matchScore\": 85,\n");
        prompt.append("      \"reason\": \"추천 사유 (한국어, 2-3문장)\"\n");
        prompt.append("    }\n");
        prompt.append("  ],\n");
        prompt.append("  \"overallAnalysis\": \"전체 분석 결과 (한국어, 2-3문장)\",\n");
        prompt.append("  \"newRewardSuggestion\": \"새로운 포상 제안 (해당 없으면 null)\"\n");
        prompt.append("}\n");
        prompt.append("```\n");
        prompt.append("\n주의사항:\n");
        prompt.append("- matchScore는 0-100 사이 숫자\n");
        prompt.append("- 가장 적합한 포상 1-3개만 추천\n");
        prompt.append("- 90점 이상이면 우수사원/MVP 계열 추천 고려\n");
        prompt.append("- 코멘트에서 키워드를 분석하여 매칭\n");
        prompt.append("- 새로운 포상 제안은 95점 이상이거나 특별한 성과가 있을 때만");

        return prompt.toString();
    }

    /**
     * OpenAI API 호출
     */
    private String callOpenAiApi(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("messages", List.of(
                Map.of("role", "system", "content", "당신은 HR 포상 추천 전문가입니다. 반드시 JSON 형식으로만 응답하세요."),
                Map.of("role", "user", "content", prompt)
        ));
        requestBody.put("temperature", 0.7);
        requestBody.put("max_tokens", 1000);

        try {
            String jsonBody = objectMapper.writeValueAsString(requestBody);
            HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);

            log.info("[OpenAI] API 호출 시작 - 모델: {}", model);
            ResponseEntity<String> response = restTemplate.exchange(
                    OPENAI_API_URL,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                String content = root.path("choices").path(0).path("message").path("content").asText();
                log.info("[OpenAI] API 호출 성공");
                return content;
            }
        } catch (Exception e) {
            log.error("[OpenAI] API 호출 오류: {}", e.getMessage());
            throw new RuntimeException("OpenAI API 호출 실패", e);
        }

        return null;
    }

    /**
     * 응답 파싱
     */
    private OpenAiRecommendationResult parseResponse(String response) {
        if (response == null || response.isEmpty()) {
            return null;
        }

        try {
            // JSON 블록 추출 (```json ... ``` 형태 처리)
            String jsonContent = response;
            if (response.contains("```json")) {
                int start = response.indexOf("```json") + 7;
                int end = response.indexOf("```", start);
                if (end > start) {
                    jsonContent = response.substring(start, end).trim();
                }
            } else if (response.contains("```")) {
                int start = response.indexOf("```") + 3;
                int end = response.indexOf("```", start);
                if (end > start) {
                    jsonContent = response.substring(start, end).trim();
                }
            }

            JsonNode root = objectMapper.readTree(jsonContent);

            OpenAiRecommendationResult result = new OpenAiRecommendationResult();
            result.setOverallAnalysis(root.path("overallAnalysis").asText(""));

            String newSuggestion = root.path("newRewardSuggestion").asText(null);
            if (newSuggestion != null && !newSuggestion.equals("null") && !newSuggestion.isEmpty()) {
                result.setNewRewardSuggestion(newSuggestion);
            }

            List<OpenAiRewardRecommendation> recommendations = new ArrayList<>();
            JsonNode rewardsNode = root.path("recommendedRewards");
            if (rewardsNode.isArray()) {
                for (JsonNode rewardNode : rewardsNode) {
                    OpenAiRewardRecommendation rec = new OpenAiRewardRecommendation();
                    rec.setRewardName(rewardNode.path("rewardName").asText(""));
                    rec.setMatchScore(rewardNode.path("matchScore").asInt(50));
                    rec.setReason(rewardNode.path("reason").asText(""));
                    recommendations.add(rec);
                }
            }
            result.setRecommendedRewards(recommendations);

            return result;
        } catch (Exception e) {
            log.error("[OpenAI] 응답 파싱 실패: {}", e.getMessage());
            return null;
        }
    }

    /**
     * OpenAI 추천 결과 클래스
     */
    @lombok.Data
    public static class OpenAiRecommendationResult {
        private List<OpenAiRewardRecommendation> recommendedRewards;
        private String overallAnalysis;
        private String newRewardSuggestion;
    }

    @lombok.Data
    public static class OpenAiRewardRecommendation {
        private String rewardName;
        private int matchScore;
        private String reason;
    }
}