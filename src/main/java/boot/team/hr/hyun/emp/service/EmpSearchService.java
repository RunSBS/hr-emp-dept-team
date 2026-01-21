// src/main/java/boot/team/hr/hyun/emp/service/EmpSearchService.java
package boot.team.hr.hyun.emp.service;

import boot.team.hr.hyun.emp.dto.EmpDto;
import boot.team.hr.hyun.emp.entity.Emp;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class EmpSearchService {

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional(readOnly = true)
    public List<EmpDto> executeNativeQuery(String sql) {
        // 1. 먼저 AI가 만든 SQL로 사번(EMP_ID) 리스트를 가져옵니다.
        List<String> empIds = entityManager.createNativeQuery(sql).getResultList();

        if (empIds.isEmpty()) {
            return new ArrayList<>();
        }

        // 2. 찾아낸 사번들을 사용하여 사원 테이블(EMP)에서 전체 정보를 조회합니다.
        // 예: SELECT * FROM EMP WHERE EMP_ID IN ('L2611101', ...)
        String detailSql = "SELECT * FROM EMP WHERE EMP_ID IN (:ids)";
        return entityManager.createNativeQuery(detailSql, Emp.class) // Emp 엔티티 매핑
                .setParameter("ids", empIds)
                .getResultList();
    }
}