package boot.team.hr.min.invite.controller;


import boot.team.hr.min.invite.dto.InviteDto;
import boot.team.hr.min.invite.service.InviteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/invite")
public class InviteController {

    private final InviteService inviteService;

    @PostMapping("/create")
    public ResponseEntity<Long> createInvite(@RequestBody InviteDto dto) {
        Long inviteId = inviteService.createInvite(dto);
        return ResponseEntity.ok(inviteId);
    }

    /**
     * 초대 수락
     * (이메일 기준)
     */
    @PostMapping("/complete")
    public ResponseEntity<Void> completeInvite(@RequestParam String email) {
        inviteService.completeInvite(email);
        return ResponseEntity.ok().build();
    }

    /**
     * 전체 조회
     */
    @GetMapping
    public ResponseEntity<List<InviteDto>> findAll() {
        return ResponseEntity.ok(inviteService.findAll());
    }

    /**
     * 단건 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<InviteDto> findById(@PathVariable Long id) {
        return ResponseEntity.ok(inviteService.findById(id));
    }

    /**
     * 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        inviteService.delete(id);
        return ResponseEntity.noContent().build();
    }
}