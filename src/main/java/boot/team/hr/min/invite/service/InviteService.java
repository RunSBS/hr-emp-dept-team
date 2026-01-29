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

    //c
    @Transactional
    public Long createInvite(InviteDto dto) {
        Emp emp = empRepository.findById(dto.getEmpId())
                .orElseThrow(() ->
                        new IllegalArgumentException("사원을 찾을 수 없습니다.")
                );

        Invite invite = Invite.from(emp, dto);
        Invite saved = inviteRepository.save(invite);

        String inviteLink = "http://localhost:5173/empsign?email=" + dto.getEmail();

        try {
            mailService.sendInviteMail(dto.getEmail(), inviteLink);
        } catch (Exception e) {
            // 로깅 후 트랜잭션 유지 여부 결정
            System.err.println("메일 발송 실패: " + e.getMessage());
            // 원하면 예외를 런타임으로 변환해 트랜잭션 롤백 가능
            // throw new RuntimeException(e);
        }

        return saved.getId();
    }

    //u
    @Transactional
    public void completeInvite(String email) {

        Invite invite = inviteRepository
                .findByEmailAndStatus(email, "PENDING")
                .orElseThrow(() ->
                        new IllegalArgumentException("유효한 초대가 없습니다.")
                );

        invite.update();
    }
    //페이징
    @Transactional(readOnly = true)
    public Page<InviteDto> findByStatus(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return inviteRepository.findByStatus(status, pageable)
                .map(InviteDto::from);
    }
    //r
    @Transactional(readOnly = true)
    public List<InviteDto> findAll() {
        return inviteRepository.findAll()
                .stream()
                .map(InviteDto::from)
                .toList();
    }
    //r
    @Transactional(readOnly = true)
    public InviteDto findById(Long id) {
        Invite invite = inviteRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("초대를 찾을 수 없습니다.")
                );

        return InviteDto.from(invite);
    }

    //d
    @Transactional
    public void delete(Long id) {
        inviteRepository.deleteById(id);
    }
    
}
