import { useEffect, useState } from "react";
import axios from "axios";
import { Card, Button, Row, Col, Badge } from "react-bootstrap";

import MeetingBookingModal from "../components/MeetingBookingModal.jsx";
import MeetingRoomModal from "../components/MeetingRoomModal.jsx";

import "../styles/meetingManage.css";

const MeetingManage = () => {
    const [rooms, setRooms] = useState([]);
    const [bookings, setBookings] = useState([]);

    // 예약 모달용
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [editingBooking, setEditingBooking] = useState(null);

    // 회의실 모달용
    const [roomModalOpen, setRoomModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);

    /* =========================
       회의실 + 예약 조회
    ========================= */
    const fetchData = async () => {
        const [roomRes, bookingRes] = await Promise.all([
            axios.get("/back/room"),
            axios.get("/back/booking"),
        ]);

        setRooms(roomRes.data);
        setBookings(bookingRes.data);
    };

    useEffect(() => {
        fetchData();
    }, []);

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
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <Button
                    variant="primary"
                    onClick={() => {
                        setEditingRoom(null);
                        setRoomModalOpen(true);
                    }}
                >
                    새 회의실 생성
                </Button>
            </div>

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
                                    <div className="d-flex justify-content-between">
                                        <h5>{r.name}</h5>
                                        <Badge bg={inUse ? "danger" : "success"} className="status-badge">
                                            {inUse ? "사용중" : "예약 가능"}
                                        </Badge>
                                    </div>

                                    <div>
                                        위치-{r.location}
                                    </div>
                                    <div>수용인원-{r.capacity}명</div>
                                    <div className="d-flex justify-content-end gap-2 flex-wrap">
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
                                            className="btn-room-edit"
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

            {/* 예약 모달 */}
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

            {/* 회의실 생성/수정 모달 */}
            {roomModalOpen && (
                <MeetingRoomModal
                    room={editingRoom}
                    onClose={() => setRoomModalOpen(false)}
                    onSuccess={fetchData}
                />
            )}
        </>
    );
};

export default MeetingManage;
