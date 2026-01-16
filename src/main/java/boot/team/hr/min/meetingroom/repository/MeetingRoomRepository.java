package boot.team.hr.min.meetingroom.repository;

import boot.team.hr.min.meetingroom.entity.MeetingRoom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MeetingRoomRepository extends JpaRepository<MeetingRoom, String> {
    Page<MeetingRoom> findByNameContaining(String keyword, Pageable pageable);
}
