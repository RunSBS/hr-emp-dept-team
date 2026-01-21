// src/main/java/boot/team/hr/hyun/emp/controller/EmpSearchController.java
package boot.team.hr.hyun.emp.controller;

import boot.team.hr.hyun.emp.dto.SqlRequestDto;
import boot.team.hr.hyun.emp.service.EmpSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RequestMapping("/api/emp")
public class EmpSearchController {

    private final EmpSearchService empSearchService;

    @PostMapping("/query")
    public ResponseEntity<?> queryFromFlask(@RequestBody SqlRequestDto requestDto) {
        try {
            // Flask에서 넘어온 SQL 실행
            List<?> result = empSearchService.executeNativeQuery(requestDto.getSql());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("SQL 실행 에러: " + e.getMessage());
        }
    }
}