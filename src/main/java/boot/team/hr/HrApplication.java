package boot.team.hr;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class HrApplication {

    public static void main(String[] args) {

        SpringApplication.run(HrApplication.class, args);
    }

}
