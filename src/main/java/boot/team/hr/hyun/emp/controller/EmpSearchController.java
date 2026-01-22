// src/main/java/boot/team/hr/hyun/emp/controller/EmpSearchController.java
package boot.team.hr.hyun.emp.controller;

import boot.team.hr.hyun.emp.dto.SqlRequestDto;
import boot.team.hr.hyun.emp.service.EmpSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// CORS 설정은 Flask가 대리인 역할을 하므로 필요에 따라 유지하거나 조정하세요.
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/emp")
public class EmpSearchController {

    private final EmpSearchService empSearchService;

    @PostMapping("/query")
    public ResponseEntity<?> queryFromFlask(@RequestBody SqlRequestDto requestDto) {
        try {
            // 1. 서비스 호출
            List<?> result = empSearchService.executeNativeQuery(requestDto.getSql());

            // 2. 결과가 비어있어도 200 OK와 빈 리스트를 반환 (정상 조회 결과)
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            // 3. SQL 문법 오류 등이 나면 500 에러를 반환
            // 이렇게 해야 Flask 코드의 spring_response.status_code != 200 조건에 걸립니다.
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
}