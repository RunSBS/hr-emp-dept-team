package boot.team.hr.gyu.service;

import boot.team.hr.gyu.dto.PythonRecommendResponse;
import boot.team.hr.gyu.entity.EvaluationResult;
import boot.team.hr.gyu.entity.RewardPolicy;
import boot.team.hr.hyun.emp.entity.Emp;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class PythonAiService {

    @Value("${ai.python.enabled:false}")
    private boolean pythonEnabled;

    @Value("${ai.python.url:http://localhost:5000}")
    private String pythonUrl;

    private final RestTemplate restTemplate;

    public PythonAiService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Python AI 서비스 활성화 여부
     */
    public boolean isEnabled() {
        return pythonEnabled;
    }

    /**
     * Python AI 서비스 사용 가능 여부 (활성화 + 연결 가능)
     */
    public boolean isAvailable() {
        if (!pythonEnabled) {
            return false;
        }

        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(
                    pythonUrl + "/gyu/reward/health",
                    Map.class
            );
            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            log.warn("[Python AI] 서비스 연결 실패: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Python AI 서비스를 통한 포상 추천
     */
    public PythonRecommendResponse getRecommendations(
            Emp emp,
            List<EvaluationResult> evaluations,
            List<RewardPolicy> policies) {

        if (!pythonEnabled) {
            log.debug("[Python AI] 서비스 비활성화 상태");
            return null;
        }

        try {
            // 평균 점수 계산
            double avgScore = evaluations.stream()
                    .filter(e -> e.getTotalScore() != null)
                    .mapToInt(EvaluationResult::getTotalScore)
                    .average()
                    .orElse(0.0);

            // 코멘트 추출
            List<String> comments = evaluations.stream()
                    .map(EvaluationResult::getComment)
                    .filter(c -> c != null && !c.trim().isEmpty())
                    .collect(Collectors.toList());

            // 요청 데이터 구성
            Map<String, Object> requestBody = new HashMap<>();

            // employee 정보
            Map<String, Object> employeeData = new HashMap<>();
            employeeData.put("empId", emp.getEmpId());
            employeeData.put("empName", emp.getEmpName());
            employeeData.put("avgScore", avgScore);
            employeeData.put("comments", comments);
            requestBody.put("employee", employeeData);

            // policies 정보
            List<Map<String, Object>> policiesData = policies.stream()
                    .map(p -> {
                        Map<String, Object> policyMap = new HashMap<>();
                        policyMap.put("policyId", p.getPolicyId());
                        policyMap.put("policyName", p.getPolicyName());
                        policyMap.put("description", p.getDescription() != null ?
                                p.getDescription() : p.getPolicyName());
                        return policyMap;
                    })
                    .collect(Collectors.toList());
            requestBody.put("policies", policiesData);

            // HTTP 요청
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            log.info("[Python AI] 추천 요청 - 직원: {}, 코멘트 수: {}, 정책 수: {}",
                    emp.getEmpName(), comments.size(), policies.size());

            ResponseEntity<PythonRecommendResponse> response = restTemplate.exchange(
                    pythonUrl + "/gyu/reward/recommend",
                    HttpMethod.POST,
                    request,
                    PythonRecommendResponse.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                PythonRecommendResponse result = response.getBody();
                log.info("[Python AI] 추천 완료 - 추천 수: {}",
                        result.getRecommendations() != null ? result.getRecommendations().size() : 0);
                return result;
            }

            return null;

        } catch (RestClientException e) {
            log.error("[Python AI] API 호출 실패: {}", e.getMessage());
            return null;
        } catch (Exception e) {
            log.error("[Python AI] 처리 중 오류: {}", e.getMessage(), e);
            return null;
        }
    }
}