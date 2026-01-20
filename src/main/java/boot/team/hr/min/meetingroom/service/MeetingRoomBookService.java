package boot.team.hr.min.meetingroom.service;

import boot.team.hr.hyun.emp.entity.Emp;
import boot.team.hr.hyun.emp.repo.EmpRepository;
import boot.team.hr.min.meetingroom.entity.MeetingRoom;
import boot.team.hr.min.meetingroom.repository.MeetingRoomRepository;
import boot.team.hr.min.meetingroom.dto.MeetingRoomBookDto;
import boot.team.hr.min.meetingroom.entity.MeetingRoomBook;
import boot.team.hr.min.meetingroom.repository.MeetingRoomBookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class MeetingRoomBookService {

    private final MeetingRoomBookRepository bookRepository;
    private final MeetingRoomRepository meetingRoomRepository;
    private final EmpRepository empRepository;

    // 전체 조회
    public List<MeetingRoomBookDto> findAll() {
        return bookRepository.findAll()
                .stream()
                .map(MeetingRoomBookDto::from)
                .collect(Collectors.toList());
    }

    // 생성
    public MeetingRoomBookDto create(MeetingRoomBookDto dto) {

        MeetingRoom meetingRoom = meetingRoomRepository
                .findById(dto.getMeetingRoomId())
                .orElseThrow(() -> new IllegalArgumentException("회의실 없음"));

        Emp emp = empRepository.findById(dto.getEmpId())//
                .orElseThrow(() -> new IllegalArgumentException("사원 없음"));

        MeetingRoomBook book = new MeetingRoomBook();
        book.update(meetingRoom, emp, dto.getStartTime(), dto.getEndTime(), dto.getDescription());

        bookRepository.save(book);
        return MeetingRoomBookDto.from(book);
    }

    // 수정
    public MeetingRoomBookDto update(Long id, MeetingRoomBookDto dto) {

        MeetingRoomBook book = bookRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("예약 없음"));

        MeetingRoom meetingRoom = meetingRoomRepository
                .findById(dto.getMeetingRoomId())
                .orElseThrow(() -> new IllegalArgumentException("회의실 없음"));

        Emp emp = empRepository
                .findById(dto.getEmpId())
                .orElseThrow(() -> new IllegalArgumentException("사원 없음"));

        book.update(meetingRoom, emp, dto.getStartTime(), dto.getEndTime(), dto.getDescription());

        return MeetingRoomBookDto.from(book);
    }

    // 삭제
    public void delete(Long id) {
        bookRepository.deleteById(id);
    }
}
