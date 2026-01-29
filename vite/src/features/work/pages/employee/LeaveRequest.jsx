import React, { useEffect, useMemo, useState } from "react";
import "../../styles/LeaveRequest.css";
import axios from "axios";
import {
    Table,
    Button,
    Modal,
    Form,
    Alert,
    Spinner,
    Badge,
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

    // ✅ 페이지네이션
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        fetchLeaveTypes();
        fetchMyLeaves();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            const data = res.data || [];
            setMyLeaves(data);
            setCurrentPage(1); // ✅ 새로 조회 시 1페이지로
        } catch (err) {
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

            await fetchMyLeaves();
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

    /* ===============================
       ✅ 페이지네이션 계산
    =============================== */
    const totalPages = useMemo(() => {
        const n = Math.ceil((myLeaves?.length || 0) / pageSize);
        return n === 0 ? 1 : n;
    }, [myLeaves, pageSize]);

    const pagedLeaves = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return (myLeaves || []).slice(start, start + pageSize);
    }, [myLeaves, currentPage]);

    useEffect(() => {
        // 데이터 줄어들어서 현재 페이지가 범위를 넘으면 보정
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [currentPage, totalPages]);

    const goPage = (p) => {
        if (p < 1 || p > totalPages) return;
        setCurrentPage(p);
    };

    const renderPagination = () => {
        if ((myLeaves?.length || 0) <= pageSize) return null;

        const pagesToShow = 6; // 버튼 최대 표시 수(1 2 3 ... 6 느낌)
        let start = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
        let end = start + pagesToShow - 1;

        if (end > totalPages) {
            end = totalPages;
            start = Math.max(1, end - pagesToShow + 1);
        }

        const items = [];
        for (let p = start; p <= end; p++) items.push(p);

        return (
            <div className="lr-pagination">
                <button
                    className="lr-page-btn"
                    onClick={() => goPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    type="button"
                >
                    ‹
                </button>

                {start > 1 && (
                    <>
                        <button className="lr-page-btn" onClick={() => goPage(1)} type="button">
                            1
                        </button>
                        {start > 2 && <span className="lr-ellipsis">…</span>}
                    </>
                )}

                {items.map((p) => (
                    <button
                        key={p}
                        className={`lr-page-btn ${p === currentPage ? "active" : ""}`}
                        onClick={() => goPage(p)}
                        type="button"
                    >
                        {p}
                    </button>
                ))}

                {end < totalPages && (
                    <>
                        {end < totalPages - 1 && <span className="lr-ellipsis">…</span>}
                        <button
                            className="lr-page-btn"
                            onClick={() => goPage(totalPages)}
                            type="button"
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                <button
                    className="lr-page-btn"
                    onClick={() => goPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    type="button"
                >
                    ›
                </button>
            </div>
        );
    };

    return (
        <div className="leave-request-page">
            {/* ===== Header ===== */}
            <div className="lr-header">
                <h2 className="lr-title">휴가 신청 / 현황</h2>
                <p className="lr-subtitle">휴가를 신청하고 승인 상태를 확인할 수 있습니다.</p>
            </div>

            {/* ===== Actions ===== */}
            <div className="lr-actions">
                <Button className="lr-primary-btn" onClick={() => setShowModal(true)}>
                    + 휴가 신청
                </Button>
                <Button variant="outline-secondary" onClick={fetchMyLeaves} disabled={loading}>
                    새로고침
                </Button>
            </div>

            {/* ===== Alerts / Loading ===== */}
            {error && (
                <Alert variant="danger" className="lr-alert">
                    {error}
                </Alert>
            )}

            {loading && (
                <div className="lr-loading">
                    <Spinner animation="border" size="sm" />
                    <span>불러오는 중...</span>
                </div>
            )}

            {/* ===== List ===== */}
            {!loading && myLeaves.length === 0 && !error && (
                <Alert variant="info" className="lr-alert">
                    휴가 신청 내역이 없습니다.
                </Alert>
            )}

            {!loading && myLeaves.length > 0 && (
                <div className="lr-card lr-table-wrap">
                    <div className="lr-table-head">
                        <div>
                            <h5 className="lr-table-title">내 휴가 신청 내역</h5>
                            <div className="lr-table-subtitle">
                                총 <b>{myLeaves.length}</b>건 · 페이지 <b>{currentPage}</b> /{" "}
                                <b>{totalPages}</b>
                            </div>
                        </div>
                    </div>

                    <Table bordered hover responsive className="lr-table">
                        <thead>
                        <tr>
                            <th>휴가 유형</th>
                            <th>기간</th>
                            <th>사유</th>
                            <th>상태</th>
                        </tr>
                        </thead>

                        <tbody>
                        {pagedLeaves.map((leave) => (
                            <tr key={leave.leaveId}>
                                <td className="lr-type">
                                    <div className="lr-type-name">{leave.leaveTypeName}</div>
                                    <div className="lr-type-sub">
                                        {leave.isPaid ? "유급" : "무급"}
                                    </div>
                                </td>

                                <td>
                                    {leave.startDate} <span className="lr-tilde">~</span>{" "}
                                    {leave.endDate}
                                </td>

                                <td className="lr-reason">{leave.leaveReason ?? "-"}</td>

                                <td>{renderStatus(leave.approvalStatus)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>

                    {renderPagination()}
                </div>
            )}

            {/* ===== Modal ===== */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
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

                        <div className="lr-modal-grid">
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
                        </div>

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

                        <div className="lr-modal-actions">
                            <Button variant="secondary" onClick={() => setShowModal(false)} type="button">
                                취소
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? "신청 중..." : "신청"}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default LeaveRequest;
