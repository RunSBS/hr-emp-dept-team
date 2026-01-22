package boot.team.hr.hyun.emp.service;

import boot.team.hr.hyun.emp.entity.Emp;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EmpSearchService {

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional(readOnly = true)
    public List<Emp> executeNativeQuery(String sql) {
        // try-catch를 제거하거나, catch에서 다시 RuntimeException을 던져서
        // 컨트롤러가 에러 상태(500)를 Flask에게 전달할 수 있게 합니다.
        try {
            return entityManager.createNativeQuery(sql, Emp.class).getResultList();
        } catch (Exception e) {
            System.err.println("AI SQL 실행 중 DB 에러: " + e.getMessage());
            // 에러를 던져야 컨트롤러에서 500 에러를 반환할 수 있습니다.
            throw new RuntimeException("SQL 실행 오류: " + e.getMessage());
        }
    }
}