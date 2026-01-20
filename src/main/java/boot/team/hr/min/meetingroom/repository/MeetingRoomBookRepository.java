package boot.team.hr.min.meetingroom.repository;

import boot.team.hr.min.meetingroom.entity.MeetingRoomBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MeetingRoomBookRepository extends JpaRepository<MeetingRoomBook, Long>{
}
