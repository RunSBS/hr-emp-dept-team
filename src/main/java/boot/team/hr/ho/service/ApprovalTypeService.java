package boot.team.hr.ho.service;

import boot.team.hr.ho.entity.ApprovalType;
import boot.team.hr.ho.repository.ApprovalTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApprovalTypeService {

    private final ApprovalTypeRepository repository;

    public ApprovalType getTypeById(Long typeId) {
        return repository.findById(typeId)
                .orElseThrow(() -> new IllegalArgumentException("결재 타입을 찾을 수 없습니다. typeId=" + typeId));
    }

    public ApprovalType getTypeByName(String typeName) {
        return repository.findByTypeName(typeName);
    }
}
