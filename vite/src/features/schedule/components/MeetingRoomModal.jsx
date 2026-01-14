import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/meetingRoomModal.css";

const MeetingRoomModal = ({ room, onClose, onSuccess }) => {
    const isEdit = !!room;

    const [form, setForm] = useState({
        meetingRoomId: "",
        name: "",
        location: "",
        capacity: ""
    });

    useEffect(() => {
        if (room) {
            setForm({
                meetingRoomId: room.meetingRoomId,
                name: room.name,
                location: room.location,
                capacity: room.capacity
            });
        }
    }, [room]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        const payload = {
            ...form,
            capacity: parseInt(form.capacity)
        };

        if (isEdit) {
            await axios.put(`/back/room/${form.meetingRoomId}`, payload);
            alert("회의실 수정 완료");
        } else {
            await axios.post("/back/room", payload);
            alert("회의실 생성 완료");
        }

        onSuccess();
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <h4>{isEdit ? "회의실 수정" : "회의실 생성"}</h4>

                <div className="form-group">
                    <label>ID</label>
                    <input
                        name="meetingRoomId"
                        value={form.meetingRoomId}
                        onChange={handleChange}
                        readOnly={isEdit}
                    />
                </div>

                <div className="form-group">
                    <label>이름</label>
                    <input name="name" value={form.name} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>위치</label>
                    <input name="location" value={form.location} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>수용 인원</label>
                    <input
                        name="capacity"
                        type="number"
                        value={form.capacity}
                        onChange={handleChange}
                    />
                </div>

                <div className="modal-actions">
                    <button className="btn-secondary" onClick={onClose}>
                        취소
                    </button>
                    <button className="btn-primary" onClick={handleSubmit}>
                        {isEdit ? "수정" : "생성"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MeetingRoomModal;
