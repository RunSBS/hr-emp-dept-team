package boot.team.hr.min.account.controller;

import boot.team.hr.min.account.dto.AccountDTO;
import boot.team.hr.min.account.security.CustomUserDetails;
import boot.team.hr.min.account.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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

        if (authentication == null || !authentication.isAuthenticated()) {
            return Map.of("authenticated", false);
        }

        CustomUserDetails user =
                (CustomUserDetails) authentication.getPrincipal();

        return Map.of(
                "authenticated", true,
                "email", user.getUsername(),
                "role", user.getFinalRole()
        );
    }


}
