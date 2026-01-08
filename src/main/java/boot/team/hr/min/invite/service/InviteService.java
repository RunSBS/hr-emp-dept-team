package boot.team.hr.min.invite.service;

import boot.team.hr.min.invite.dto.InviteDto;
import boot.team.hr.min.invite.entity.Invite;
import boot.team.hr.min.invite.repository.InviteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class InviteService {

    private final InviteRepository inviteRepository;

    /**
     * 초대 생성
     */
    public Long createInvite(InviteDto dto) {

        boolean exists = inviteRepository.existsByEmailAndStatus(
                dto.getEmail(), "PENDING"
        );
        if (exists) {
            throw new IllegalStateException("이미 초대가 존재합니다.");
        }

        Invite invite = new Invite(
                dto.getEmpId(),
                dto.getEmail()
        );

        Invite saved = inviteRepository.save(invite);
        return saved.getId();
    }

    /**
     * 초대 수락
     */
    public void completeInvite(String email) {

        Invite invite = inviteRepository
                .findByEmailAndStatus(email, "PENDING")
                .orElseThrow(() ->
                        new IllegalArgumentException("유효한 초대가 없습니다.")
                );

        invite.complete();
    }

    /**
     * 전체 조회
     */
    public List<InviteDto> findAll() {
        return inviteRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * 단건 조회
     */
    public InviteDto findById(Long id) {
        Invite invite = inviteRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("초대를 찾을 수 없습니다.")
                );

        return toDto(invite);
    }

    /**
     * 삭제
     */
    public void delete(Long id) {
        inviteRepository.deleteById(id);
    }

    // =====================
    // Entity → DTO 변환
    // =====================
    private InviteDto toDto(Invite invite) {
        InviteDto dto = new InviteDto();
        dto.setId(invite.getId());
        dto.setEmpId(invite.getEmpId());
        dto.setEmail(invite.getEmail());
        dto.setStatus(invite.getStatus());
        dto.setCreatedAt(invite.getCreatedAt());
        dto.setCompletedAt(invite.getCompletedAt());
        return dto;
    }
}
