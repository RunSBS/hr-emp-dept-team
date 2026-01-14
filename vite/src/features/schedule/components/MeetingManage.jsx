import { useEffect, useState } from "react";
import axios from "axios";
import { Card, Button, Row, Col, Badge } from "react-bootstrap";

import MeetingBookingModal from "../components/MeetingBookingModal.jsx";
import MeetingRoomModal from "../components/MeetingRoomModal.jsx";

import "../styles/meetingManage.css";

const MeetingManage = () => {
    const [rooms, setRooms] = useState([]);

    // 예약 모달용
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [editingBooking, setEditingBooking] = useState(null);

    // 회의실 모달용
    const [roomModalOpen, setRoomModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);

    const fetchData = async () => {
        const roomRes = await axios.get("/back/room");
        const bookingRes = await axios.get("/back/booking");

        // 회의실 + 예약 병합 (회의실당 1개 예약 가정)
        const merged = roomRes.data.map(r => ({
            ...r,
            booking: bookingRes.data.find(
                b => b.meetingRoomId === r.meetingRoomId
            )
        }));

        setRooms(merged);
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                {/* 회의실 생성 버튼 */}
                <Button
                    variant="primary"
                    onClick={() => {
                        setEditingRoom(null);   // 생성 모드
                        setRoomModalOpen(true);
                    }}
                >
                    새 회의실 생성
                </Button>
            </div>

            <Row xs={1} md={2} lg={3} className="g-4">
                {rooms.map(r => (
                    <Col key={r.meetingRoomId}>
                        <Card className="h-100 shadow-sm">
                            <Card.Body>
                                <div className="d-flex justify-content-between">
                                    <h5>{r.name}</h5>
                                    {r.booking ? (
                                        <Badge bg="danger">예약중</Badge>
                                    ) : (
                                        <Badge bg="success">예약 가능</Badge>
                                    )}
                                </div>

                                <div className="text-muted small">
                                    {r.location} · {r.capacity}명
                                </div>

                                <hr />

                                {/* 예약 정보 */}
                                {r.booking ? (
                                    <div className="booking-info">
                                        <div>
                                            <strong>예약자</strong> {r.booking.empId}
                                        </div>
                                        <div>
                                            {r.booking.startTime} ~ {r.booking.endTime}
                                        </div>
                                        <div className="text-muted">
                                            {r.booking.description}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-muted">
                                        예약이 없습니다.
                                    </div>
                                )}
                            </Card.Body>

                            <Card.Footer className="bg-white border-0">
                                <div className="d-flex justify-content-end gap-2 flex-wrap">
                                    {/* 회의실 수정 */}
                                    <Button
                                        size="sm"
                                        variant="outline-primary"
                                        onClick={() => {
                                            setEditingRoom(r);
                                            setRoomModalOpen(true);
                                        }}
                                    >
                                        회의실 수정
                                    </Button>

                                    {r.booking ? (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="outline-secondary"
                                                onClick={() => {
                                                    setSelectedRoom(r);
                                                    setEditingBooking(r.booking);
                                                }}
                                            >
                                                예약 수정
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline-danger"
                                                onClick={async () => {
                                                    await axios.delete(
                                                        `/back/booking/${r.booking.id}`
                                                    );
                                                    fetchData();
                                                }}
                                            >
                                                예약 취소
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="success"
                                            onClick={() => {
                                                setSelectedRoom(r);
                                                setEditingBooking(null);
                                            }}
                                        >
                                            예약
                                        </Button>
                                    )}
                                </div>
                            </Card.Footer>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* 예약 모달 */}
            {selectedRoom && (
                <MeetingBookingModal
                    room={selectedRoom}
                    booking={editingBooking}
                    onClose={() => {
                        setSelectedRoom(null);
                        setEditingBooking(null);
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
