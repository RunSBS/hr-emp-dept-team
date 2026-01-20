import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "react-bootstrap";
import "../styles/meetingBookingModal.css";
import "../styles/project.css"
import { useAuth } from "../../../main/AuthContext.jsx";


const MeetingBookingModal = ({ room, booking, onClose, onSuccess }) => {
    const { user } = useAuth();
    const isEdit = !!booking;
    const isMyBooking = booking && booking.empId === user.empId;

    const [myBookingModalOpen, setMyBookingModalOpen] = useState(false);

    const [form, setForm] = useState({
        description: "",
    });

    const [bookings, setBookings] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [startHour, setStartHour] = useState(null);
    const [endHour, setEndHour] = useState(null);
    const myBookings = bookings.filter(
        b =>
            b.empId === user.empId &&
            b.meetingRoomId === room.meetingRoomId
    );
    const hours = Array.from({ length: 17 }, (_, i) => i + 6);

    /* =========================
       수정 모드 초기화
    ========================= */
    useEffect(() => {
        if (booking) {
            const start = new Date(booking.startTime);
            const end = new Date(booking.endTime);

            setSelectedDate(start);
            setStartHour(start.getHours());
            setEndHour(end.getHours() - 1);
            setForm({
                description: booking.description || "",
            });
        } else {
            setForm({ description: "" });
            setStartHour(null);
            setEndHour(null);
        }
    }, [booking]);

    /* =========================
       예약 목록 조회
    ========================= */
    useEffect(() => {
        fetchBookings();
    }, [room, selectedDate]);

    const fetchBookings = async () => {
        const res = await axios.get("/back/booking");
        setBookings(
            res.data.filter(b => b.meetingRoomId === room.meetingRoomId)
        );
    };

    /* =========================
       시간 예약 여부
    ========================= */
    const isBooked = (hour) =>
        bookings.some(b => {
            const start = new Date(b.startTime);
            const end = new Date(b.endTime);
            return (
                start.toDateString() === selectedDate.toDateString() &&
                hour >= start.getHours() &&
                hour < end.getHours()
            );
        });

    /* =========================
       시간 블록 클릭
    ========================= */
    const handleHourClick = (hour) => {

        if (isEdit && !isMyBooking) return;

        if (isBooked(hour)) return;

        if (startHour === hour && endHour === null) {
            setStartHour(null);
            setEndHour(null);
            return;
        }

        // 시작 시간 새로 선택
        if (startHour === null || endHour !== null) {
            setStartHour(hour);
            setEndHour(null);
            return;
        }

        // 끝 시간 선택
        if (hour <= startHour) {
            alert("끝 시간은 시작 시간보다 커야 합니다.");
            return;
        }

        for (let h = startHour; h <= hour; h++) {
            if (isBooked(h)) {
                alert("선택 구간 중 예약된 시간이 있습니다.");
                return;
            }
        }

        setEndHour(hour);
    };

    /* =========================
       예약 / 수정
    ========================= */
    const handleReserve = async () => {
        if (isEdit && !isMyBooking) {
            return alert("본인 예약만 수정할 수 있습니다.");
        }

        if (startHour === null || endHour === null) {
            return alert("시간을 선택해주세요.");
        }

        const yyyy = selectedDate.getFullYear();
        const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const dd = String(selectedDate.getDate()).padStart(2, "0");

        const startTime = `${yyyy}-${mm}-${dd}T${String(startHour).padStart(2, "0")}:00:00`;
        const endTime = `${yyyy}-${mm}-${dd}T${String(endHour + 1).padStart(2, "0")}:00:00`;

        const payload = {
            meetingRoomId: room.meetingRoomId,
            empId: user.empId,
            description: form.description,
            startTime,
            endTime,
        };

        try {
            if (isEdit) {
                await axios.put(`/back/booking/${booking.id}`, payload);
                alert("예약 수정 완료");
                onSuccess();
                onClose(); // 수정은 종료
            } else {
                await axios.post("/back/booking", payload);
                alert("예약 생성 완료");

                onSuccess();      // 부모 새로고침
                fetchBookings();  // 현재 모달 내부 갱신

                //모달 유지
                setStartHour(null);
                setEndHour(null);
                setForm({ description: "" });
            }
        } catch (e) {
            console.error(e);
            alert("예약 실패");
        }
    };

    /* =========================
       예약 삭제 (내 예약만)
    ========================= */
    const handleDelete = async () => {
        if (!isMyBooking) {
            return alert("본인 예약만 삭제할 수 있습니다.");
        }

        if (!window.confirm("예약을 삭제하시겠습니까?")) return;

        try {
            await axios.delete(`/back/booking/${booking.id}`);
            alert("예약 삭제 완료");
            onSuccess();
            onClose();
        } catch (e) {
            console.error(e);
            alert("삭제 실패");
        }
    };

    return (
        <>
            <div className="modal-overlay">
                <div className="modal-content">
                    <h5>{room.name} 예약</h5>

                    {/* 사원 ID */}
                    <div className="form-group">
                        <label>사원 ID</label>
                        <input value={user.empId} readOnly />
                    </div>

                    <div className="form-group">
                        <label>설명</label>
                        <input
                            value={form.description}
                            onChange={e => setForm({ description: e.target.value })}
                            disabled={isEdit && !isMyBooking}
                        />
                    </div>

                    <div className="mb-2">
                        <label>예약 날짜</label>
                        <input
                            type="date"
                            value={selectedDate.toISOString().slice(0, 10)}
                            onChange={e => setSelectedDate(new Date(e.target.value))}
                            disabled={isEdit && !isMyBooking}
                        />
                        <Button
                            size="sm"
                            className="ms-2 fc-like-btn"
                            onClick={() => setMyBookingModalOpen(true)}
                        >
                            내 예약 확인
                        </Button>

                    </div>

                    {/* 시간 블록 */}
                    <div className="timetable">
                        {hours.map(h => (
                            <div
                                key={h}
                                onClick={() => handleHourClick(h)}
                                className={`time-block
                                    ${isBooked(h) ? "booked" : ""}
                                    ${startHour !== null && endHour !== null && h >= startHour && h <= endHour ? "selected" : ""}
                                    ${startHour === h && endHour === null ? "selecting" : ""}
                                `}
                            >
                                {h}시
                            </div>
                        ))}
                    </div>

                    <div className="modal-actions">
                        <Button variant="secondary" onClick={onClose}>
                            닫기
                        </Button>

                        {isEdit && isMyBooking && (
                            <Button variant="danger" onClick={handleDelete}>
                                삭제
                            </Button>
                        )}

                        <Button
                            className="fc-like-btn"
                            onClick={handleReserve}
                            disabled={
                                startHour === null ||
                                endHour === null ||
                                (isEdit && !isMyBooking)
                            }
                        >
                            {isEdit ? "수정" : "예약"}
                        </Button>
                    </div>
                </div>
            </div>
            {myBookingModalOpen && (
                <div className="mini-modal-overlay">
                    <div className="mini-modal">
                        <h6>내 예약 목록</h6>

                        {myBookings.length === 0 && (
                            <div className="text-muted small">예약 없음</div>
                        )}

                        {myBookings.map(b => (
                            <div
                                key={b.id}
                                className="d-flex justify-content-between align-items-center mb-2"
                            >
                            <span className="small">
                                {new Date(b.startTime).toLocaleDateString()}{" "}
                                {new Date(b.startTime).getHours()}시 ~
                                {new Date(b.endTime).getHours()}시
                            </span>
                            <span className="small">{b.description}</span>

                                <div className="d-flex gap-1">
                                    <Button
                                        size="sm"
                                        variant="danger"
                                        onClick={async () => {
                                            if (!window.confirm("삭제하시겠습니까?")) return;
                                            await axios.delete(`/back/booking/${b.id}`);
                                            fetchBookings();
                                        }}
                                    >
                                        삭제
                                    </Button>
                                </div>
                            </div>
                        ))}

                        <div className="text-end mt-2">
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => setMyBookingModalOpen(false)}
                            >
                                닫기
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MeetingBookingModal;
