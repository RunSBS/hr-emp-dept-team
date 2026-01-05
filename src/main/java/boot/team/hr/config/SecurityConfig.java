package boot.team.hr.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 개발 중이면 CSRF 끄기
                .csrf(csrf -> csrf.disable())

                // 기본 로그인 화면 끄기
                .formLogin(form -> form.disable())

                // 기본 로그아웃도 필요 없으면 끄기
                .logout(logout -> logout.disable())

                // 일단 전부 허용 (React + Flask 연동용)
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()
                );

        return http.build();
    }
}
