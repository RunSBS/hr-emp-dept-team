import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Modal, Form, Alert, Spinner } from "react-bootstrap";

const AdminWorkPolicy = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        startTime: "",
        lateTime: "",
        overtimeStart: "",
        description: "",
        effectiveFrom: "",
        effectiveTo: "",
    });
    const [editingId, setEditingId] = useState(null);

    // ===============================
    // 정책 목록 조회
    // ===============================
    const fetchPolicies = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get("/back/admin/attendance-policy");
            // 데이터가 배열인지 확인 후 저장
            if (Array.isArray(res.data)) {
                setPolicies(res.data);
            } else {
                console.warn("예상치 못한 정책 데이터 구조:", res.data);
                setPolicies([]);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "정책 조회 실패");
            setPolicies([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPolicies();
    }, []);

    // ===============================
    // 모달 열기/닫기
    // ===============================
    const openModal = (policy = null) => {
        if (policy) {
            setForm({
                startTime: policy.startTime ?? "",
                lateTime: policy.lateTime ?? "",
                overtimeStart: policy.overtimeStart ?? "",
                description: policy.description ?? "",
                effectiveFrom: policy.effectiveFrom ? policy.effectiveFrom.slice(0, 10) : "",
                effectiveTo: policy.effectiveTo ? policy.effectiveTo.slice(0, 10) : "",
            });
            setEditingId(policy.policyId ?? null);
        } else {
            setForm({
                startTime: "",
                lateTime: "",
                overtimeStart: "",
                description: "",
                effectiveFrom: "",
                effectiveTo: "",
            });
            setEditingId(null);
        }
        setShowModal(true);
    };

    const closeModal = () => setShowModal(false);

    // ===============================
    // 입력 처리
    // ===============================
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // ===============================
    // 정책 생성/수정
    // ===============================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (editingId) {
                await axios.put(`/back/admin/attendance-policy/${editingId}`, form);
            } else {
                await axios.post("/back/admin/attendance-policy", form);
            }
            fetchPolicies();
            closeModal();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "정책 저장 실패");
        } finally {
            setLoading(false);
        }
    };

    // ===============================
    // 렌더링
    // ===============================
    return (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h2 className="mb-4">관리자 근태 정책 관리</h2>
            <Button className="mb-3" onClick={() => openModal()}>
                신규 정책 추가
            </Button>

            {/* 에러 표시 */}
            {error && <Alert variant="danger">{error}</Alert>}

            {/* 로딩 표시 */}
            {loading && <Spinner animation="border" />}

            {/* 정책 테이블 */}
            {!loading && policies.length > 0 && (
                <Table striped bordered hover>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>시작 시간</th>
                        <th>지각 시간</th>
                        <th>야근 시작</th>
                        <th>설명</th>
                        <th>적용 기간</th>
                        <th>작업</th>
                    </tr>
                    </thead>
                    <tbody>
                    {policies.map((p) => (
                        <tr key={p.policyId}>
                            <td>{p.policyId}</td>
                            <td>{p.startTime}</td>
                            <td>{p.lateTime}</td>
                            <td>{p.overtimeStart}</td>
                            <td>{p.description}</td>
                            <td>
                                {p.effectiveFrom ?? ""} ~ {p.effectiveTo ?? ""}
                            </td>
                            <td>
                                <Button size="sm" onClick={() => openModal(p)}>
                                    수정
                                </Button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            )}

            {/* 모달 */}
            <Modal show={showModal} onHide={closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{editingId ? "정책 수정" : "신규 정책 추가"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-2">
                            <Form.Label>시작 시간 (HHmm)</Form.Label>
                            <Form.Control
                                type="number"
                                name="startTime"
                                value={form.startTime}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>지각 시간 (HHmm)</Form.Label>
                            <Form.Control
                                type="number"
                                name="lateTime"
                                value={form.lateTime}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>야근 시작 (HHmm)</Form.Label>
                            <Form.Control
                                type="number"
                                name="overtimeStart"
                                value={form.overtimeStart}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>설명</Form.Label>
                            <Form.Control
                                type="text"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>적용 시작일</Form.Label>
                            <Form.Control
                                type="date"
                                name="effectiveFrom"
                                value={form.effectiveFrom}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>적용 종료일</Form.Label>
                            <Form.Control
                                type="date"
                                name="effectiveTo"
                                value={form.effectiveTo}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Button type="submit" disabled={loading}>
                            {loading ? "저장 중..." : "저장"}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default AdminWorkPolicy;
