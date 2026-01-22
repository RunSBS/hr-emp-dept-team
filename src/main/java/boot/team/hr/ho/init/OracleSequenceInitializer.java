package boot.team.hr.ho.init;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OracleSequenceInitializer implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;


    @Override
    public void run(ApplicationArguments args) {
        createSequenceIfNotExists("SEQ_APPROVAL_DOC");
        createSequenceIfNotExists("SEQ_APPROVAL_FILE");
        createSequenceIfNotExists("SEQ_APPROVAL_LINE");
        createSequenceIfNotExists("SEQ_APPROVAL_LOG");
    }

    private void createSequenceIfNotExists(String sequenceName) {
        Integer count = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM USER_SEQUENCES
                WHERE SEQUENCE_NAME = ?
                """,
                Integer.class,
                sequenceName
        );

        if (count != null && count == 0) {
            jdbcTemplate.execute(
                    "CREATE SEQUENCE " + sequenceName + " START WITH 1 INCREMENT BY 1"
            );
            System.out.println("✅ Sequence created: " + sequenceName);
        }
    }
}
