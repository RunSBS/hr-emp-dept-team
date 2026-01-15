package boot.team.hr.min.account.service;

import boot.team.hr.hyun.emp.entity.Emp;
import boot.team.hr.hyun.emp.repo.EmpRepository;
import boot.team.hr.min.account.entity.Account;
import boot.team.hr.min.account.repository.AccountRepository;
import boot.team.hr.min.account.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final AccountRepository accountRepository;
    private final EmpRepository empRepository;

    @Override
    public UserDetails loadUserByUsername(String email) {

        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Account not found"));

        String finalRole;
        String empId = null;

        if ("ADMIN".equals(account.getRole())) {
            finalRole = "ADMIN";
            // empId는 null 유지
        }
        else if ("EMP".equals(account.getRole())) {
            Emp emp = empRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("Emp not found"));

            finalRole = emp.getEmpRole();
            empId = emp.getEmpId();
        }
        else {
            throw new UsernameNotFoundException("Invalid role");
        }

        return new CustomUserDetails(account, finalRole, empId);
    }
}
