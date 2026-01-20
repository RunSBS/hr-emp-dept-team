package boot.team.hr.min.invite.service;

import boot.team.hr.hyun.emp.entity.Emp;
import boot.team.hr.hyun.emp.repo.EmpRepository;
import boot.team.hr.min.invite.dto.InviteDto;
import boot.team.hr.min.invite.entity.Invite;
import boot.team.hr.min.invite.repository.InviteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class InviteService {

    private final InviteRepository inviteRepository;
    private final MailService mailService;
    private final EmpRepository empRepository;
    /**
     * 초대 생성
     */
    public Long createInvite(InviteDto dto) {

        // 1. 사원 조회 (이미 존재하는 프로필)
        Emp emp = empRepository.findById(dto.getEmpId())
                .orElseThrow(() ->
                        new IllegalArgumentException("사원을 찾을 수 없습니다.")
                );

        // 2. Invite 생성
        Invite invite = new Invite(emp, dto.getEmail());
        Invite saved = inviteRepository.save(invite);

        // 3. 초대 링크
        String inviteLink =
                "http://localhost:5173/empsign?email=" + dto.getEmail();

        // 4. 메일 발송
        mailService.sendInviteMail(dto.getEmail(), inviteLink);

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
    //페이징
    public Page<InviteDto> findByStatus(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return inviteRepository.findByStatus(status, pageable)
                .map(this::toDto);
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
        dto.setEmpId(invite.getEmp().getEmpId());
        dto.setEmail(invite.getEmail());
        dto.setStatus(invite.getStatus());
        dto.setCreatedAt(invite.getCreatedAt());
        dto.setCompletedAt(invite.getCompletedAt());
        return dto;
    }

    @Transactional
    public void completeInviteByEmail(String email) {
        inviteRepository.findByEmailAndStatus(email, "PENDING")
                .ifPresent(invite -> {
                    invite.complete();  // status = COMPLETED, completedAt = now()
                    inviteRepository.save(invite);
                });
    }
    
}
