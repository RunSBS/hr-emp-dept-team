package boot.team.hr.min.meetingroom.entity;

import boot.team.hr.min.meetingroom.dto.MeetingRoomDto;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name="MEETING_ROOM")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeetingRoom {
    @Id
    @Column(name="meeting_room_id",length = 20)
    private String meetingRoomId;

    @Column(nullable = false,length = 20)
    private String name;

    @Column(nullable = false,length = 20)
    private String location;

    @Column(nullable = false)
    private Integer capacity;

    public static MeetingRoom from(MeetingRoomDto dto){
        return MeetingRoom.builder()
                .meetingRoomId(dto.getMeetingRoomId())
                .name(dto.getName())
                .location(dto.getLocation())
                .capacity(dto.getCapacity())
                .build();
    }

    public void update(MeetingRoomDto dto) {
        this.name = dto.getName();
        this.location = dto.getLocation();
        this.capacity = dto.getCapacity();
    }
}
