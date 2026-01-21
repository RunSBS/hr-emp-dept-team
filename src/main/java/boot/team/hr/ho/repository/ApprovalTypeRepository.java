package boot.team.hr.ho.repository;

import boot.team.hr.ho.entity.ApprovalType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ApprovalTypeRepository extends JpaRepository<ApprovalType, Long> {

    // 필요하면 이름으로 조회하는 메서드 추가
    ApprovalType findByTypeName(String typeName);

}