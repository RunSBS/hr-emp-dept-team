import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/project.css"
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
        <>
            {/* backdrop */}
            <div className="modal-backdrop fade show" />

            <div
                className="modal fade show"
                style={{ display: "block" }}
                tabIndex="-1"
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">

                        {/* ===== header ===== */}
                        <div className="modal-header">
                            <h5 className="modal-title">
                                {isEdit ? "회의실 수정" : "회의실 생성"}
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={onClose}
                            />
                        </div>

                        {/* ===== body ===== */}
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">ID</label>
                                <input
                                    className="form-control"
                                    name="meetingRoomId"
                                    value={form.meetingRoomId}
                                    onChange={handleChange}
                                    readOnly={isEdit}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">이름</label>
                                <input
                                    className="form-control"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">위치</label>
                                <input
                                    className="form-control"
                                    name="location"
                                    value={form.location}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">수용 인원</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="capacity"
                                    value={form.capacity}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* ===== footer ===== */}
                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={onClose}
                            >
                                취소
                            </button>
                            <button
                                className="btn fc-like-btn"
                                onClick={handleSubmit}
                            >
                                {isEdit ? "수정" : "생성"}
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default MeetingRoomModal;
