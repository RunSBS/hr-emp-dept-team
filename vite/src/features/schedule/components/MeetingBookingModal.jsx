import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/meetingBookingModal.css";
const MeetingBookingModal = ({ room, booking, onClose, onSuccess }) => {
    const isEdit = !!booking;

    const [form, setForm] = useState({
        empId: "",
        startTime: "",
        endTime: "",
        description: ""
    });

    useEffect(() => {
        if (booking) {
            setForm({
                empId: booking.empId,
                startTime: booking.startTime,
                endTime: booking.endTime,
                description: booking.description || ""
            });
        }
    }, [booking]);

    const handleSubmit = async () => {
        const payload = {
            meetingRoomId: room.meetingRoomId,
            ...form
        };

        if (isEdit) {
            await axios.put(`/back/booking/${booking.id}`, payload);
            alert("예약 수정 완료");
        } else {
            await axios.post("/back/booking", payload);
            alert("예약 생성 완료");
        }

        onSuccess();
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <h4>{room.name} 예약</h4>

                <div className="form-group">
                    <label>사원 ID</label>
                    <input
                        value={form.empId}
                        onChange={e =>
                            setForm({ ...form, empId: e.target.value })
                        }
                    />
                </div>

                <div className="form-group">
                    <label>시작</label>
                    <input
                        type="datetime-local"
                        value={form.startTime}
                        onChange={e =>
                            setForm({ ...form, startTime: e.target.value })
                        }
                    />
                </div>

                <div className="form-group">
                    <label>종료</label>
                    <input
                        type="datetime-local"
                        value={form.endTime}
                        onChange={e =>
                            setForm({ ...form, endTime: e.target.value })
                        }
                    />
                </div>

                <div className="form-group">
                    <label>설명</label>
                    <input
                        value={form.description}
                        onChange={e =>
                            setForm({ ...form, description: e.target.value })
                        }
                    />
                </div>

                <div className="modal-actions">
                    <button
                        className="btn-secondary"
                        onClick={onClose}
                    >
                        취소
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleSubmit}
                    >
                        {isEdit ? "수정" : "예약"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MeetingBookingModal;
