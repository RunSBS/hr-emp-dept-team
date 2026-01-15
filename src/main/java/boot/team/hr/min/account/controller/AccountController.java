package boot.team.hr.min.account.controller;

import boot.team.hr.min.account.dto.AccountDTO;
import boot.team.hr.min.account.security.CustomUserDetails;
import boot.team.hr.min.account.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/signup")
public class AccountController {

    private final AccountService accountService;

    // 관리자 회원가입
    @PostMapping("/admin")
    public ResponseEntity<?> adminSignUp(@RequestBody AccountDTO request) {
        Long adminId = accountService.adminSignUp(request);
        return ResponseEntity.ok(adminId);
    }
    @PostMapping("/emp")
    public ResponseEntity<?> employeeSignUp(@RequestBody AccountDTO request) {
        Long empId = accountService.employeeSignUp(request);
        return ResponseEntity.ok(empId);
    }

    @GetMapping("/me")
    public Map<String, Object> me(Authentication authentication) {

        Map<String, Object> result = new HashMap<>();

        if (authentication == null || !authentication.isAuthenticated()) {
            result.put("authenticated", false);
            return result;
        }

        CustomUserDetails user =
                (CustomUserDetails) authentication.getPrincipal();

        result.put("authenticated", true);
        result.put("email", user.getUsername());
        result.put("role", user.getFinalRole());

        if (user.getEmpId() != null) {
            result.put("empId", user.getEmpId());
        }

        return result;
    }


}
