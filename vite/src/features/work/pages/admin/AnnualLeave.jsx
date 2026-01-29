import React, { useEffect, useState } from "react";
import "../../styles/AnnualLeave.css";
import axios from "axios";
import {
    Table,
    Button,
    Modal,
    Form,
    Spinner,
    Alert
} from "react-bootstrap";

const AnnualLeave = () => {
    const [balances, setBalances] = useState([]);
    const [years, setYears] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);

    // 연도 필터
    const [selectedYear, setSelectedYear] = useState("");

    const currentYear = new Date().getFullYear();

    const [createForm, setCreateForm] = useState({
        employeeId: "",
        totalDays: "",
        year: currentYear
    });

    const [editForm, setEditForm] = useState({
        balanceId: null,
        totalDays: ""
    });

    /* ===============================
       최초 로딩
    =============================== */
    useEffect(() => {
        fetchYears();
    }, []);

    useEffect(() => {
        fetchBalances();
    }, [selectedYear]);

    /* ===============================
       연도 목록 조회
    =============================== */
    const fetchYears = async () => {
        try {
            const res = await axios.get("/back/admin/leave-balance/years");
            setYears(res.data || []);
        } catch (e) {
            console.error("연도 목록 조회 실패");
        }
    };

    /* ===============================
       연차 목록 조회
    =============================== */
    const fetchBalances = async () => {
        setLoading(true);
        setError(null);

        try {
            let url = "/back/admin/leave-balance";
            if (selectedYear) {
                url += `?year=${selectedYear}`;
            }

            const res = await axios.get(url);
            setBalances(res.data || []);
        } catch (e) {
            setError("연차 정보 조회 실패");
        } finally {
            setLoading(false);
        }
    };

    /* ===============================
       연차 최초 부여
    =============================== */
    const handleCreate = async (e) => {
        e.preventDefault();

        try {
            await axios.post("/back/admin/leave-balance", null, {
                params: {
                    employeeId: createForm.employeeId,
                    year: Number(createForm.year),
                    totalMinutes: Number(createForm.totalDays) * 480
                }
            });

            setShowCreate(false);
            setCreateForm({
                employeeId: "",
                totalDays: "",
                year: currentYear
            });

            fetchBalances();
            fetchYears(); // 새 연도 반영
        } catch (e) {
            alert(e.response?.data?.message || "연차 부여 실패");
        }
    };

    /* ===============================
       연차 수정
    =============================== */
    const handleEdit = async (e) => {
        e.preventDefault();

        try {
            await axios.put(
                `/back/admin/leave-balance/${editForm.balanceId}`,
                {
                    totalLeaveMinutes: Number(editForm.totalDays) * 480
                }
            );

            setShowEdit(false);
            fetchBalances();
        } catch (e) {
            alert(e.response?.data?.message || "연차 수정 실패");
        }
    };

    return (
        <div className="annual-leave">
            {/* ===== Header ===== */}
            <div className="al-header">
                <h2 className="al-title">연차 관리</h2>
                <p className="al-subtitle">연도별 연차를 조회하고, 연차 부여/수정을 할 수 있습니다.</p>
            </div>

            {/* ===== Top Controls ===== */}
            <div className="al-controls al-card">
                <Button className="al-btn" onClick={() => setShowCreate(true)}>
                    연차 부여
                </Button>

                <div className="al-controls-right">
                    <div className="al-year-filter">
                        <div className="al-label">연도</div>
                        <Form.Select
                            className="al-select"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                        >
                            <option value="">전체 연도</option>
                            {years.map((y) => (
                                <option key={y} value={y}>
                                    {y}년
                                </option>
                            ))}
                        </Form.Select>
                    </div>
                </div>
            </div>

            {/* ===== Loading / Alerts ===== */}
            {loading && (
                <div className="al-loading">
                    <Spinner animation="border" size="sm" className="me-2" />
                    불러오는 중...
                </div>
            )}

            {error && (
                <Alert className="al-alert" variant="danger">
                    {error}
                </Alert>
            )}

            {/* ===== Table ===== */}
            {!loading && balances.length > 0 && (
                <div className="al-card al-table-wrap">
                    <Table bordered hover responsive className="al-table">
                        <thead>
                        <tr>
                            <th>사원 ID</th>
                            <th>연도</th>
                            <th>총 연차</th>
                            <th>사용 연차</th>
                            <th>잔여 연차</th>
                            <th style={{ width: 90 }}>관리</th>
                        </tr>
                        </thead>
                        <tbody>
                        {balances.map((b) => (
                            <tr key={b.balanceId}>
                                <td>{b.employeeId}</td>
                                <td>{b.leaveYear}</td>
                                <td>
                                    <span className="al-badge al-badge-total">
                                        {b.totalLeaveMinutes / 480}일
                                    </span>
                                </td>
                                <td>
                                    <span className="al-badge al-badge-used">
                                        {b.usedLeaveMinutes / 480}일
                                    </span>
                                </td>
                                <td>
                                    <span className="al-badge al-badge-remaining">
                                        {b.remainingLeaveMinutes / 480}일
                                    </span>
                                </td>
                                <td>
                                    <Button
                                        size="sm"
                                        className="al-btn al-btn-sm"
                                        onClick={() => {
                                            setEditForm({
                                                balanceId: b.balanceId,
                                                totalDays: b.totalLeaveMinutes / 480,
                                            });
                                            setShowEdit(true);
                                        }}
                                    >
                                        수정
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </div>
            )}

            {!loading && balances.length === 0 && (
                <Alert className="al-alert" variant="secondary">
                    조회된 연차 정보가 없습니다.
                </Alert>
            )}

            {/* ===== Create Modal ===== */}
            <Modal
                show={showCreate}
                onHide={() => setShowCreate(false)}
                centered
                dialogClassName="al-modal"
            >
                <Modal.Header closeButton>
                    <Modal.Title>연차 부여</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleCreate} className="al-form">
                        <Form.Group className="mb-2">
                            <Form.Label className="al-label">사원 ID</Form.Label>
                            <Form.Control
                                className="al-input"
                                value={createForm.employeeId}
                                onChange={(e) =>
                                    setCreateForm({
                                        ...createForm,
                                        employeeId: e.target.value,
                                    })
                                }
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label className="al-label">연도</Form.Label>
                            <Form.Control
                                className="al-input"
                                type="number"
                                value={createForm.year}
                                onChange={(e) =>
                                    setCreateForm({
                                        ...createForm,
                                        year: e.target.value,
                                    })
                                }
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="al-label">총 연차 (일)</Form.Label>
                            <Form.Control
                                className="al-input"
                                type="number"
                                value={createForm.totalDays}
                                onChange={(e) =>
                                    setCreateForm({
                                        ...createForm,
                                        totalDays: e.target.value,
                                    })
                                }
                                required
                            />
                        </Form.Group>

                        <div className="al-modal-actions">
                            <Button
                                variant="outline-secondary"
                                onClick={() => setShowCreate(false)}
                                type="button"
                            >
                                취소
                            </Button>
                            <Button className="al-btn" type="submit">
                                부여
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* ===== Edit Modal ===== */}
            <Modal
                show={showEdit}
                onHide={() => setShowEdit(false)}
                centered
                dialogClassName="al-modal"
            >
                <Modal.Header closeButton>
                    <Modal.Title>연차 수정</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleEdit} className="al-form">
                        <Form.Group className="mb-3">
                            <Form.Label className="al-label">총 연차 (일)</Form.Label>
                            <Form.Control
                                className="al-input"
                                type="number"
                                value={editForm.totalDays}
                                onChange={(e) =>
                                    setEditForm({
                                        ...editForm,
                                        totalDays: e.target.value,
                                    })
                                }
                                required
                            />
                        </Form.Group>

                        <div className="al-modal-actions">
                            <Button
                                variant="outline-secondary"
                                onClick={() => setShowEdit(false)}
                                type="button"
                            >
                                취소
                            </Button>
                            <Button className="al-btn" type="submit">
                                수정
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );

};

export default AnnualLeave;
