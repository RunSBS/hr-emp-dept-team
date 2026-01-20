import React, { useEffect, useState } from "react";
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
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <h2 className="mb-4">연차 관리</h2>

            {/* ===============================
               상단 컨트롤 영역
            =============================== */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <Button onClick={() => setShowCreate(true)}>
                    연차 부여
                </Button>

                <Form.Select
                    style={{ width: "200px" }}
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

            {loading && <Spinner animation="border" />}
            {error && <Alert variant="danger">{error}</Alert>}

            {/* ===============================
               연차 테이블
            =============================== */}
            {!loading && balances.length > 0 && (
                <Table bordered hover>
                    <thead>
                    <tr>
                        <th>사원 ID</th>
                        <th>연도</th>
                        <th>총 연차</th>
                        <th>사용 연차</th>
                        <th>잔여 연차</th>
                        <th>관리</th>
                    </tr>
                    </thead>
                    <tbody>
                    {balances.map((b) => (
                        <tr key={b.balanceId}>
                            <td>{b.employeeId}</td>
                            <td>{b.leaveYear}</td>
                            <td>{b.totalLeaveMinutes / 480}일</td>
                            <td>{b.usedLeaveMinutes / 480}일</td>
                            <td>{b.remainingLeaveMinutes / 480}일</td>
                            <td>
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        setEditForm({
                                            balanceId: b.balanceId,
                                            totalDays: b.totalLeaveMinutes / 480
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
            )}

            {!loading && balances.length === 0 && (
                <Alert variant="secondary">
                    조회된 연차 정보가 없습니다.
                </Alert>
            )}

            {/* ===============================
               연차 부여 모달
            =============================== */}
            <Modal show={showCreate} onHide={() => setShowCreate(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>연차 부여</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleCreate}>
                        <Form.Group className="mb-2">
                            <Form.Label>사원 ID</Form.Label>
                            <Form.Control
                                value={createForm.employeeId}
                                onChange={(e) =>
                                    setCreateForm({
                                        ...createForm,
                                        employeeId: e.target.value
                                    })
                                }
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label>연도</Form.Label>
                            <Form.Control
                                type="number"
                                value={createForm.year}
                                onChange={(e) =>
                                    setCreateForm({
                                        ...createForm,
                                        year: e.target.value
                                    })
                                }
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>총 연차 (일)</Form.Label>
                            <Form.Control
                                type="number"
                                value={createForm.totalDays}
                                onChange={(e) =>
                                    setCreateForm({
                                        ...createForm,
                                        totalDays: e.target.value
                                    })
                                }
                                required
                            />
                        </Form.Group>

                        <Button type="submit">부여</Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* ===============================
               연차 수정 모달
            =============================== */}
            <Modal show={showEdit} onHide={() => setShowEdit(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>연차 수정</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleEdit}>
                        <Form.Group className="mb-3">
                            <Form.Label>총 연차 (일)</Form.Label>
                            <Form.Control
                                type="number"
                                value={editForm.totalDays}
                                onChange={(e) =>
                                    setEditForm({
                                        ...editForm,
                                        totalDays: e.target.value
                                    })
                                }
                                required
                            />
                        </Form.Group>

                        <Button type="submit">수정</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default AnnualLeave;
