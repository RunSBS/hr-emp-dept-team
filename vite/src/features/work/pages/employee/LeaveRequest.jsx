import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Table,
    Button,
    Modal,
    Form,
    Alert,
    Spinner,
    Badge
} from "react-bootstrap";

const LeaveRequest = () => {
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [myLeaves, setMyLeaves] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        leaveTypeId: "",
        startDate: "",
        endDate: "",
        reason: "",
    });
    useEffect(() => {
        fetchLeaveTypes();
        fetchMyLeaves(); // 이것도 같이 호출하는 게 정상
    }, []);

    /* ===============================
       휴가 유형 조회
    =============================== */
    const fetchLeaveTypes = async () => {
        try {
            const res = await axios.get("/back/leave/types");
            setLeaveTypes(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    /* ===============================
       내 휴가 신청 목록 조회
    =============================== */
    const fetchMyLeaves = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await axios.get("/back/leave/my");

            if (res.data.length === 0) {
                setMyLeaves([]);
            } else {
                setMyLeaves(res.data);
            }
        } catch (err) {
            // 진짜 에러만 메시지 표시
            if (err.response && err.response.status >= 500) {
                setError("휴가 신청 내역 조회 중 서버 오류가 발생했습니다.");
            }
        } finally {
            setLoading(false);
        }
    };

    /* ===============================
       입력 처리
    =============================== */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    /* ===============================
       휴가 신청
    =============================== */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await axios.post("/back/leave/request", {
                leaveTypeId: form.leaveTypeId,
                startDate: form.startDate,
                endDate: form.endDate,
                leaveReason: form.reason,
            });

            setShowModal(false);
            setForm({
                leaveTypeId: "",
                startDate: "",
                endDate: "",
                reason: "",
            });
            fetchMyLeaves();
        } catch (err) {
            setError(err.response?.data?.message || "휴가 신청 실패");
        } finally {
            setLoading(false);
        }
    };

    /* ===============================
       승인 상태 뱃지
    =============================== */
    const renderStatus = (status) => {
        switch (status) {
            case "APPROVED":
                return <Badge bg="success">승인</Badge>;
            case "REJECTED":
                return <Badge bg="danger">반려</Badge>;
            default:
                return <Badge bg="secondary">대기</Badge>;
        }
    };

    return (
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <h2 className="mb-4">휴가 신청 / 현황</h2>

            <Button className="mb-3" onClick={() => setShowModal(true)}>
                휴가 신청
            </Button>

            {error && <Alert variant="danger">{error}</Alert>}
            {loading && <Spinner animation="border" />}

            {/* ===============================
          휴가 신청 내역
            =============================== */}
            {!loading && myLeaves.length === 0 && !error && (
                <Alert variant="info">휴가 신청 내역이 없습니다.</Alert>
            )}
            {myLeaves.length > 0 && (
                <Table bordered hover>
                    <thead>
                    <tr>
                        <th>휴가 유형</th>
                        <th>기간</th>
                        <th>상태</th>
                    </tr>
                    </thead>
                    <tbody>
                    {myLeaves.map((leave) => (
                        <tr key={leave.leaveId}>
                            <td>{leave.leaveTypeName}</td>
                            <td>{leave.startDate} ~ {leave.endDate}</td>
                            <td>{leave.approvalStatus}</td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            )}

            {/* ===============================
          휴가 신청 모달
      =============================== */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>휴가 신청</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-2">
                            <Form.Label>휴가 유형</Form.Label>
                            <Form.Select
                                name="leaveTypeId"
                                value={form.leaveTypeId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">선택</option>
                                {leaveTypes.map((t) => (
                                    <option key={t.leaveTypeId} value={t.leaveTypeId}>
                                        {t.leaveName}
                                        {t.isPaid ? " (유급)" : " (무급)"}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label>시작일</Form.Label>
                            <Form.Control
                                type="date"
                                name="startDate"
                                value={form.startDate}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label>종료일</Form.Label>
                            <Form.Control
                                type="date"
                                name="endDate"
                                value={form.endDate}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>사유</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="reason"
                                value={form.reason}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Button type="submit" disabled={loading}>
                            {loading ? "신청 중..." : "신청"}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default LeaveRequest;
