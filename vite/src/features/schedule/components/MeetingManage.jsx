import { useEffect, useState } from "react";
import axios from "axios";
import { Card, Button, Row, Col, Badge } from "react-bootstrap";

import MeetingBookingModal from "../components/MeetingBookingModal.jsx";
import MeetingRoomModal from "../components/MeetingRoomModal.jsx";

import "../styles/meetingManage.css";
import "../styles/project.css";

const MeetingManage = () => {
    const [rooms, setRooms] = useState([]);
    const [bookings, setBookings] = useState([]);

    // 예약 모달용
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [editingBooking, setEditingBooking] = useState(null);

    // 회의실 모달용
    const [roomModalOpen, setRoomModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);

    // 페이징 상태
    const [pageable, setPageable] = useState({ page: 0, size: 6 });
    const [totalPages, setTotalPages] = useState(0);

    // 🔍 검색 상태
    const [searchText, setSearchText] = useState("");

    /* =========================
       회의실 + 예약 조회 (페이징 + 검색)
    ========================= */
    const fetchData = async () => {
        try {
            const [roomRes, bookingRes] = await Promise.all([
                axios.get("/back/room", {
                    params: {
                        page: pageable.page,
                        size: pageable.size,
                        keyword: searchText
                    }
                }),
                axios.get("/back/booking"),
            ]);

            setRooms(roomRes.data.content);
            setTotalPages(roomRes.data.totalPages);
            setBookings(bookingRes.data);
        } catch (err) {
            console.error("회의실/예약 조회 실패", err);
        }
    };

    const handleDeleteRoom = async (roomId) => {
        if (!window.confirm("정말 이 회의실을 삭제하시겠습니까?")) return;

        try {
            await axios.delete(`/back/room/${roomId}`);
            alert("회의실이 삭제되었습니다.");
            fetchData();
        } catch (err) {
            console.error("회의실 삭제 실패", err);
            alert("회의실 삭제 실패");
        }
    };

    useEffect(() => {
        fetchData();
    }, [pageable, searchText]);

    /* =========================
       현재 사용 중 여부 판단
    ========================= */
    const isRoomInUse = (roomId) => {
        const now = new Date();

        return bookings.some(b => {
            if (b.meetingRoomId !== roomId) return false;

            const start = new Date(b.startTime);
            const end = new Date(b.endTime);

            return now >= start && now < end;
        });
    };

    return (
        <div className="page-wrapper">

            {/* ===== 상단 검색 + 생성 ===== */}
            <div className="content-wrapper">
                <h2>회의실</h2>
                <div className="meeting-top-bar">
                    <div className="meeting-search-group">
                        <input
                            type="text"
                            className="meeting-search-input"
                            placeholder="회의실 검색"
                            value={searchText}
                            onChange={(e) => {
                                setSearchText(e.target.value);
                                setPageable(prev => ({ ...prev, page: 0 }));
                            }}
                        />
                        <Button
                            className="fc-like-btn"
                            onClick={() => {
                                setEditingRoom(null);
                                setRoomModalOpen(true);
                            }}
                        >
                            새 회의실 생성
                        </Button>
                    </div>
                </div>
            </div>

            <div className="section-gap" />

            {/* ===== 카드 영역 ===== */}
            <div className="content-wrapper">
                {rooms.length === 0 ? (
                    /* 🔹 중앙 정렬 empty 상태 */
                    <div className="empty-projects text-center py-5">
                        등록된 회의실이 없습니다.
                    </div>
                ) : (
                    <>
                        <Row xs={1} md={2} lg={3} className="g-4">
                            {rooms.map((r) => {
                                const inUse = isRoomInUse(r.meetingRoomId);

                                return (
                                    <Col key={r.meetingRoomId}>
                                        <Card
                                            className={`h-100 shadow-sm meeting-room-card ${
                                                inUse ? "booking-active" : ""
                                            }`}
                                        >
                                            <Card.Body>
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <h5 className="mb-0">{r.name}</h5>
                                                    <Badge bg={inUse ? "danger" : "success"}>
                                                        {inUse ? "사용중" : "예약 가능"}
                                                    </Badge>
                                                </div>

                                                <div>위치 - {r.location}</div>
                                                <div>수용인원 - {r.capacity}명</div>

                                                <div className="d-flex justify-content-end gap-2 flex-wrap mt-3">
                                                    <Button
                                                        size="sm"
                                                        className="btn-room-edit"
                                                        onClick={() => {
                                                            setEditingRoom(r);
                                                            setRoomModalOpen(true);
                                                        }}
                                                    >
                                                        회의실 수정
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        variant="danger"
                                                        onClick={() =>
                                                            handleDeleteRoom(r.meetingRoomId)
                                                        }
                                                    >
                                                        회의실 삭제
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        className="fc-like-btn"
                                                        onClick={() => {
                                                            setSelectedRoom(r);
                                                            setEditingBooking(null);
                                                        }}
                                                    >
                                                        예약
                                                    </Button>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                );
                            })}
                        </Row>

                        {/* ===== 페이지네이션 ===== */}
                        <div className="d-flex justify-content-center mt-4 gap-2">
                            <Button
                                size="sm"
                                variant="secondary"
                                disabled={pageable.page === 0}
                                onClick={() =>
                                    setPageable(prev => ({
                                        ...prev,
                                        page: prev.page - 1
                                    }))
                                }
                            >
                                이전
                            </Button>


                            <span className="text-muted">
                                {pageable.page + 1} / {totalPages}
                            </span>

                            <Button
                                size="sm"
                                variant="secondary"
                                disabled={pageable.page === totalPages - 1}
                                onClick={() =>
                                    setPageable(prev => ({
                                        ...prev,
                                        page: prev.page + 1
                                    }))
                                }
                            >
                                다음
                            </Button>
                        </div>
                    </>
                )}
            </div>

            {/* ===== 예약 모달 ===== */}
            {selectedRoom && (
                <MeetingBookingModal
                    room={selectedRoom}
                    booking={editingBooking}
                    onClose={() => {
                        setSelectedRoom(null);
                        setEditingBooking(null);
                        fetchData();
                    }}
                    onSuccess={fetchData}
                />
            )}

            {/* ===== 회의실 생성/수정 모달 ===== */}
            {roomModalOpen && (
                <MeetingRoomModal
                    room={editingRoom}
                    onClose={() => setRoomModalOpen(false)}
                    onSuccess={fetchData}
                />
            )}
        </div>
    );
};

export default MeetingManage;
