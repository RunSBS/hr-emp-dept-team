package boot.team.hr.min.meetingroom.controller;

import boot.team.hr.min.meetingroom.dto.MeetingRoomDto;
import boot.team.hr.min.meetingroom.entity.MeetingRoom;
import boot.team.hr.min.meetingroom.service.MeetingRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/room")
public class MeetingRoomController {
    private final MeetingRoomService meetingRoomService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<String> createRoom(@RequestBody MeetingRoomDto dto) {
        meetingRoomService.createRoom(dto);
        return ResponseEntity.ok("회의실 생성 완료: " + dto.getName());
    }
    @GetMapping("/")
    public List<MeetingRoomDto> findAllRoom(){
        return meetingRoomService.findAllRoom();
    }

    @GetMapping
    public Page<MeetingRoomDto> getRooms(
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 6, sort = "meetingRoomId", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        return meetingRoomService.findPage(pageable, keyword);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public void updateRoom(
            @PathVariable String id,
            @RequestBody MeetingRoomDto dto
    ) {
        meetingRoomService.updateRoom(id, dto);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void deleteRoom(@PathVariable String id) {
        meetingRoomService.deleteRoom(id);
    }
}
