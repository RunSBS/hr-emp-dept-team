package boot.team.hr.min.meetingroom.dto;

import boot.team.hr.min.meetingroom.entity.MeetingRoomBook;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MeetingRoomBookDto {
    private Long id;
    private String meetingRoomId;
    private String empId; // 외부에서 받는 사번
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String description;

    public static MeetingRoomBookDto from(MeetingRoomBook book) {
        MeetingRoomBookDto dto = new MeetingRoomBookDto();
        dto.setId(book.getId());
        dto.setMeetingRoomId(book.getMeetingRoom().getMeetingRoomId());
        dto.setEmpId(book.getEmp().getEmpId());
        dto.setStartTime(book.getStartTime());
        dto.setEndTime(book.getEndTime());
        dto.setDescription(book.getDescription());
        return dto;
    }
}
