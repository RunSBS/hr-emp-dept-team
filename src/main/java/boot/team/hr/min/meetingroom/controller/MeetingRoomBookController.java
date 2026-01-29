package boot.team.hr.min.meetingroom.controller;

import boot.team.hr.min.meetingroom.dto.MeetingRoomBookDto;
import boot.team.hr.min.meetingroom.service.MeetingRoomBookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/booking")
@RequiredArgsConstructor
public class MeetingRoomBookController {

    private final MeetingRoomBookService service;

    // 전체 조회
    @GetMapping
    public List<MeetingRoomBookDto> list() {
        return service.findAll();
    }

    // 생성
    @PostMapping
    public ResponseEntity<Long> create(@RequestBody MeetingRoomBookDto dto) {
         service.create(dto);
         return ResponseEntity.ok(dto.getId());
    }

    // 수정
    @PutMapping("/{id}")
    public void update(@PathVariable Long id, @RequestBody MeetingRoomBookDto dto) {
        service.update(id, dto);
    }

    // 삭제
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
