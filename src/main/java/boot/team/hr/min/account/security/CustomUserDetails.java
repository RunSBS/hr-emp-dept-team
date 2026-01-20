package boot.team.hr.min.account.security;

import boot.team.hr.min.account.entity.Account;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class CustomUserDetails implements UserDetails {

    private final Account account;
    private final String finalRole;
    private final String empId;
    private final String empName; //

    public CustomUserDetails(
            Account account,
            String finalRole,
            String empId,
            String empName   //
    ) {
        this.account = account;
        this.finalRole = finalRole;
        this.empId = empId;
        this.empName = empName;
    }

    public String getFinalRole() {
        return finalRole;
    }

    public Account getAccount() {
        return account;
    }

    public String getEmpId() {
        return empId;
    }

    public String getEmpName() {
        return empName;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(
                new SimpleGrantedAuthority("ROLE_" + finalRole)
        );
    }

    @Override
    public String getUsername() {
        return account.getEmail();
    }

    @Override
    public String getPassword() {
        return account.getPassword();
    }

    // status 체크는 Account 기준
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

}

