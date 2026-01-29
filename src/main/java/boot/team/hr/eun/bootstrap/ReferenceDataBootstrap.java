package boot.team.hr.eun.bootstrap;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ReferenceDataBootstrap implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        ensureWorkTypeTable();
        ensureWorkStatusTable();
        ensureLeaveTypeTable();
        ensureCompanyLocationTable(); // 테이블만 생성(초기 데이터는 선택)
    }

    /* =========================
       공통: 테이블 존재 여부
     ========================= */
    private boolean tableExists(String tableName) {
        Integer cnt = jdbcTemplate.queryForObject(
                "select count(*) from user_tables where table_name = ?",
                Integer.class,
                tableName.toUpperCase()
        );
        return cnt != null && cnt > 0;
    }

    /* =========================
       WORK_TYPE
     ========================= */
    private void ensureWorkTypeTable() {
        if (!tableExists("WORK_TYPE")) {
            jdbcTemplate.execute("""
                create table WORK_TYPE (
                    TYPE_CODE varchar2(50) primary key,
                    TYPE_NAME varchar2(100) not null,
                    IS_ACTIVE char(1) default 'Y' not null
                )
            """);
        }

        Integer rows = jdbcTemplate.queryForObject("select count(*) from WORK_TYPE", Integer.class);
        if (rows != null && rows > 0) return;

        // 초기값(사용자 제공)
        List<Object[]> data = List.of(
                new Object[]{"OFFICE", "출근", "Y"},
                new Object[]{"OUTSIDE", "외근", "Y"},
                new Object[]{"REMOTE", "재택", "N"},
                new Object[]{"NIGHT", "야간", "Y"},
                new Object[]{"LEAVE", "휴가", "Y"},
                new Object[]{"OFF", "퇴근", "Y"}
        );

        for (Object[] d : data) {
            jdbcTemplate.update(
                    "insert into WORK_TYPE(TYPE_CODE, TYPE_NAME, IS_ACTIVE) values(?,?,?)",
                    d
            );
        }
    }

    /* =========================
       WORK_STATUS
     ========================= */
    private void ensureWorkStatusTable() {
        if (!tableExists("WORK_STATUS")) {
            jdbcTemplate.execute("""
                create table WORK_STATUS (
                    STATUS_CODE varchar2(50) primary key,
                    STATUS_NAME varchar2(100) not null,
                    IS_ACTIVE char(1) default 'Y' not null
                )
            """);
        }

        Integer rows = jdbcTemplate.queryForObject("select count(*) from WORK_STATUS", Integer.class);
        if (rows != null && rows > 0) return;

        List<Object[]> data = List.of(
                new Object[]{"NORMAL", "정상", "Y"},
                new Object[]{"LATE", "지각", "Y"},
                new Object[]{"EARLY_LEAVE", "조퇴", "Y"},
                new Object[]{"ABSENT", "결근", "Y"},
                new Object[]{"PENDING", "근무 전", "Y"}
        );

        for (Object[] d : data) {
            jdbcTemplate.update(
                    "insert into WORK_STATUS(STATUS_CODE, STATUS_NAME, IS_ACTIVE) values(?,?,?)",
                    d
            );
        }
    }

    /* =========================
       LEAVE_TYPE
     ========================= */
    private void ensureLeaveTypeTable() {
        if (!tableExists("LEAVE_TYPE")) {
            jdbcTemplate.execute("""
                create table LEAVE_TYPE (
                    LEAVE_TYPE_ID number(19) primary key,
                    LEAVE_NAME varchar2(100) not null,
                    IS_PAID char(1) not null,
                    IS_ACTIVE char(1) default 'Y' not null
                )
            """);
        }

        Integer rows = jdbcTemplate.queryForObject("select count(*) from LEAVE_TYPE", Integer.class);
        if (rows != null && rows > 0) return;

        // 사용자 제공 데이터(주의: ID 고정)
        List<Object[]> data = List.of(
                new Object[]{5L, "AM", "Y", "Y"},
                new Object[]{6L, "PM", "Y", "Y"},
                new Object[]{1L, "연차", "Y", "Y"},
                new Object[]{3L, "병가", "Y", "Y"},
                new Object[]{4L, "무급휴가", "N", "Y"}
        );

        for (Object[] d : data) {
            jdbcTemplate.update(
                    "insert into LEAVE_TYPE(LEAVE_TYPE_ID, LEAVE_NAME, IS_PAID, IS_ACTIVE) values(?,?,?,?)",
                    d
            );
        }
    }

    /* =========================
       COMPANY_LOCATION (CRUD 대상)
     ========================= */
    private void ensureCompanyLocationTable() {
        if (tableExists("COMPANY_LOCATION")) return;

        jdbcTemplate.execute("""
            create table COMPANY_LOCATION (
                LOCATION_ID number(19) primary key,
                COMPANY_NAME varchar2(255) not null,
                LATITUDE number(10,7) not null,
                LONGITUDE number(10,7) not null,
                ALLOWED_RADIUS_M number(6) not null,
                ADDRESS varchar2(200),
                ACTIVE_YN char(1) default 'Y' not null,
                CREATED_AT date,
                UPDATED_AT date
            )
        """);

        // 시퀀스도 같이 (PK 자동발급용)
        jdbcTemplate.execute("""
            create sequence COMPANY_LOCATION_SEQ start with 1 increment by 1
        """);
    }
}
