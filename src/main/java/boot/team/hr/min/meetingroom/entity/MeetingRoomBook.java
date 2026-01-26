package boot.team.hr.min.meetingroom.entity;

import boot.team.hr.hyun.emp.entity.Emp;
import boot.team.hr.min.meetingroom.dto.MeetingRoomBookDto;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "MEETING_ROOM_BOOK")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeetingRoomBook {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // 예약 PK

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_room_id", nullable = false)
    private MeetingRoom meetingRoom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emp_id", nullable = false)
    private Emp emp;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(length = 50)
    private String description;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public static MeetingRoomBook from(
            MeetingRoomBookDto dto,
            MeetingRoom meetingRoom,
            Emp emp
    ) {
        return MeetingRoomBook.builder()
                .meetingRoom(meetingRoom)
                .emp(emp)
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .description(dto.getDescription())
                .build();
    }

    public void update(
            MeetingRoom meetingRoom,
            Emp emp,
            LocalDateTime startTime,
            LocalDateTime endTime,
            String description
    ) {
        this.meetingRoom = meetingRoom;
        this.emp = emp;
        this.startTime = startTime;
        this.endTime = endTime;
        this.description = description;
    }
}
