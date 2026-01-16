import { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button, ListGroup, Form, Row, Col, Badge } from "react-bootstrap";

const ScheduleModal = ({ date, schedules, empId, onClose, onChange, autoCreate }) => {
    const [mode, setMode] = useState(autoCreate ? "create" : "read"); // read | create | edit
    const [editing, setEditing] = useState(null);
    const [daySchedules, setDaySchedules] = useState(schedules);

    const [title, setTitle] = useState("");
    const [startAt, setStartAt] = useState("");
    const [endAt, setEndAt] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        setDaySchedules(schedules);

        if (mode === "create") {
            const base = date || new Date().toISOString().slice(0, 10);
            setTitle("");
            setStartAt(`${base}T09:00`);
            setEndAt(`${base}T10:00`);
            setDescription("");
        }

        if (mode === "edit" && editing) {
            setTitle(editing.title);
            setStartAt(editing.startAt.slice(0, 16));
            setEndAt(editing.endAt.slice(0, 16));
            setDescription(editing.description || "");
        }
    }, [mode, date, editing, schedules]);

    const createSchedule = async () => {
        await axios.post("/back/schedules", { empId, title, startAt, endAt, description });
        await onChange();
        if (autoCreate) onClose();
        else setMode("read");
    };

    const updateSchedule = async () => {
        await axios.put(`/back/schedules/${editing.id}`, { empId, title, startAt, endAt, description });
        await onChange();
        setEditing(null);
        setMode("read");
    };

    const deleteSchedule = async (id) => {
        if (!window.confirm("삭제하시겠습니까?")) return;
        await axios.delete(`/back/schedules/${id}`);
        await onChange();

        if (!autoCreate && date) {
            try {
                const res = await axios.get("/back/schedules");
                const dayList = res.data.filter(s => {
                    const start = s.startAt.slice(0, 10);
                    const end = s.endAt.slice(0, 10);
                    return start <= date && date <= end;
                });

                if (dayList.length === 0) {
                    onClose();
                } else {
                    setDaySchedules(dayList);
                }
            } catch (err) {
                console.error(err);
                onClose();
            }
        }
    };

    const startEdit = (s) => {
        if (s.empId !== empId) return;
        setEditing(s);
        setMode("edit");
    };

    return (
        <Modal
            show
            onHide={onClose}
            size="lg"
            centered
            backdrop="static"
            keyboard={false}
            scrollable
            enforceFocus={false} // 추가: 포커스 강제 이동 방지 (선택 사항)
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    {mode === "read" && "일정"}
                    {mode === "create" && "일정 등록"}
                    {mode === "edit" && "일정 수정"}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {/* READ 계층 */}
                {mode === "read" && (
                    <>
                        {daySchedules.length === 0 ? (
                            <p className="text-center text-muted my-4">일정이 비어있어요!</p>
                        ) : (
                            <ListGroup variant="flush" className="mb-3">
                                {daySchedules.map(s => (
                                    <ListGroup.Item
                                        key={s.id}
                                        className="d-flex justify-content-between align-items-start"
                                        variant={s.empId === empId ? "light" : "secondary"}
                                    >
                                        <div>
                                            <div className="fw-bold">{s.title}</div>
                                            <div className="small text-muted">
                                                {s.startAt} ~ {s.endAt} <Badge bg="info">{s.empId}</Badge>
                                            </div>
                                        </div>

                                        {s.empId === empId && (
                                            <div className="d-flex gap-1">
                                                <Button size="sm" variant="outline-primary" onClick={() => startEdit(s)}>
                                                    수정
                                                </Button>
                                                <Button size="sm" variant="outline-danger" onClick={() => deleteSchedule(s.id)}>
                                                    삭제
                                                </Button>
                                            </div>
                                        )}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}

                        {!autoCreate && (
                            <div className="d-grid">
                                <Button variant="success" onClick={() => setMode("create")}>
                                    + 일정 추가
                                </Button>
                            </div>
                        )}
                    </>
                )}

                {/* CREATE / EDIT 입력폼 */}
                {(mode === "create" || mode === "edit") && (
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>제목</Form.Label>
                            <Form.Control type="text" value={title} onChange={e => setTitle(e.target.value)} />
                        </Form.Group>

                        <Row className="mb-3">
                            <Col>
                                <Form.Group>
                                    <Form.Label>시작일시</Form.Label>
                                    <Form.Control type="datetime-local" value={startAt} onChange={e => setStartAt(e.target.value)} />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group>
                                    <Form.Label>종료일시</Form.Label>
                                    <Form.Control type="datetime-local" value={endAt} onChange={e => setEndAt(e.target.value)} />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>설명</Form.Label>
                            <Form.Control as="textarea" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
                        </Form.Group>

                        <div className="d-flex justify-content-end gap-2">
                            {mode === "edit" ? (
                                <Button variant="primary" onClick={updateSchedule}>수정</Button>
                            ) : (
                                <Button variant="primary" onClick={createSchedule}>저장</Button>
                            )}
                            <Button variant="secondary" onClick={() => {
                                if (autoCreate) onClose();
                                else { setMode("read"); setEditing(null); }
                            }}>
                                취소
                            </Button>
                        </div>
                    </Form>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default ScheduleModal;
