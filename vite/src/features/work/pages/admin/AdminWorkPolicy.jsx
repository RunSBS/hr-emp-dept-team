import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Modal, Form, Table, Alert, Card } from "react-bootstrap";

const AdminWorkPolicy = () => {
    // =========================
    // 근태 정책
    // =========================
    const [policies, setPolicies] = useState([]);
    const [error, setError] = useState(null);

    const [editingPolicyId, setEditingPolicyId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        startTime: "",
        lateTime: "",
        overtimeStart: "",
        breakStart: "",
        breakEnd: "",
        description: "",
        effectiveFrom: "",
        effectiveTo: "",
    });

    const fetchPolicies = async () => {
        try {
            const res = await axios.get("/back/admin/attendance-policy");
            setPolicies(res.data || []);
        } catch (e) {
            setError("근태 정책 목록을 불러오지 못했습니다.");
        }
    };

    useEffect(() => {
        fetchPolicies();
    }, []);

    const openModal = (policy = null) => {
        setError(null);
        if (policy) {
            setEditingPolicyId(policy.policyId);
            setForm({
                startTime: policy.startTime ?? "",
                lateTime: policy.lateTime ?? "",
                overtimeStart: policy.overtimeStart ?? "",
                breakStart: policy.breakStart ?? "",
                breakEnd: policy.breakEnd ?? "",
                description: policy.description ?? "",
                effectiveFrom: policy.effectiveFrom ?? "",
                effectiveTo: policy.effectiveTo ?? "",
            });
        } else {
            setEditingPolicyId(null);
            setForm({
                startTime: "",
                lateTime: "",
                overtimeStart: "",
                breakStart: "",
                breakEnd: "",
                description: "",
                effectiveFrom: "",
                effectiveTo: "",
            });
        }
        setShowModal(true);
    };

    const closeModal = () => setShowModal(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setError(null);
        try {
            const payload = {
                ...form,
                startTime: Number(form.startTime),
                lateTime: Number(form.lateTime),
                overtimeStart: Number(form.overtimeStart),
                breakStart: Number(form.breakStart),
                breakEnd: Number(form.breakEnd),
            };

            if (editingPolicyId) {
                await axios.put(`/back/admin/attendance-policy/${editingPolicyId}`, payload);
            } else {
                await axios.post("/back/admin/attendance-policy", payload);
            }

            closeModal();
            fetchPolicies();
        } catch (e) {
            setError(e?.response?.data?.message || "저장 중 오류가 발생했습니다.");
        }
    };

    // =========================
    // 회사 위치 (COMPANY_LOCATION)
    // =========================
    const [locations, setLocations] = useState([]);
    const [locError, setLocError] = useState(null);
    const [locSuccess, setLocSuccess] = useState(null);

    const [editingLocId, setEditingLocId] = useState(null);
    const [showLocModal, setShowLocModal] = useState(false);

    const [locForm, setLocForm] = useState({
        companyName: "",
        latitude: "",
        longitude: "",
        allowedRadiusM: 500,
        address: "",
        activeYn: "Y",
    });

    const fetchLocations = async () => {
        setLocError(null);
        try {
            const res = await axios.get("/back/admin/company-location");
            setLocations(res.data || []);
        } catch (e) {
            setLocError("회사 위치 목록을 불러오지 못했습니다.");
        }
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    const openLocModal = (loc = null) => {
        setLocError(null);
        setLocSuccess(null);

        if (loc) {
            setEditingLocId(loc.locationId);
            setLocForm({
                companyName: loc.companyName ?? "",
                latitude: loc.latitude ?? "",
                longitude: loc.longitude ?? "",
                allowedRadiusM: loc.allowedRadiusM ?? 500,
                address: loc.address ?? "",
                activeYn: loc.activeYn ?? "Y",
            });
        } else {
            setEditingLocId(null);
            setLocForm({
                companyName: "",
                latitude: "",
                longitude: "",
                allowedRadiusM: 500,
                address: "",
                activeYn: "Y",
            });
        }

        setShowLocModal(true);
    };

    const closeLocModal = () => setShowLocModal(false);

    const handleLocChange = (e) => {
        const { name, value } = e.target;
        setLocForm((prev) => ({ ...prev, [name]: value }));
    };

    const submitLocation = async () => {
        setLocError(null);
        setLocSuccess(null);

        if (!locForm.companyName?.trim()) {
            setLocError("회사명을 입력해주세요.");
            return;
        }
        if (locForm.latitude === "" || locForm.longitude === "") {
            setLocError("위도/경도를 입력해주세요.");
            return;
        }

        const payload = {
            companyName: locForm.companyName.trim(),
            latitude: Number(locForm.latitude),
            longitude: Number(locForm.longitude),
            allowedRadiusM: Number(locForm.allowedRadiusM || 0),
            address: locForm.address?.trim() || null,
            activeYn: locForm.activeYn || "Y",
        };

        try {
            if (editingLocId) {
                await axios.put(`/back/admin/company-location/${editingLocId}`, payload);
                setLocSuccess("회사 위치가 수정되었습니다.");
            } else {
                await axios.post("/back/admin/company-location", payload);
                setLocSuccess("회사 위치가 추가되었습니다.");
            }
            closeLocModal();
            fetchLocations();
        } catch (e) {
            setLocError(e?.response?.data?.message || "저장 중 오류가 발생했습니다.");
        }
    };

    const deleteLocation = async (locationId) => {
        if (!confirm("정말 삭제할까요?")) return;

        setLocError(null);
        setLocSuccess(null);

        try {
            await axios.delete(`/back/admin/company-location/${locationId}`);
            setLocSuccess("삭제되었습니다.");
            fetchLocations();
        } catch (e) {
            setLocError(e?.response?.data?.message || "삭제 중 오류가 발생했습니다.");
        }
    };

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            {/* =========================
                근태 정책 관리
            ========================= */}
            <h2 className="mb-3">관리자 근태 정책 관리</h2>

            {error && <Alert variant="danger">{error}</Alert>}

            <div className="mb-3">
                <Button onClick={() => openModal(null)}>+ 정책 추가</Button>
            </div>

            <Table bordered hover>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>시작</th>
                    <th>지각</th>
                    <th>야근 시작</th>
                    <th>휴게 시작</th>
                    <th>휴게 종료</th>
                    <th>설명</th>
                    <th>적용 시작</th>
                    <th>적용 종료</th>
                    <th>수정</th>
                </tr>
                </thead>
                <tbody>
                {policies.length === 0 ? (
                    <tr>
                        <td colSpan="10" className="text-center">정책이 없습니다.</td>
                    </tr>
                ) : (
                    policies.map((p) => (
                        <tr key={p.policyId}>
                            <td>{p.policyId}</td>
                            <td>{p.startTime}</td>
                            <td>{p.lateTime}</td>
                            <td>{p.overtimeStart}</td>
                            <td>{p.breakStart}</td>
                            <td>{p.breakEnd}</td>
                            <td>{p.description}</td>
                            <td>{p.effectiveFrom}</td>
                            <td>{p.effectiveTo}</td>
                            <td>
                                <Button size="sm" onClick={() => openModal(p)}>
                                    수정
                                </Button>
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={closeModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{editingPolicyId ? "정책 수정" : "정책 추가"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
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
                            <Form.Label>지각 기준 (HHmm)</Form.Label>
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
                            <Form.Label>휴게 시작 (HHmm)</Form.Label>
                            <Form.Control
                                type="number"
                                name="breakStart"
                                value={form.breakStart}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label>휴게 종료 (HHmm)</Form.Label>
                            <Form.Control
                                type="number"
                                name="breakEnd"
                                value={form.breakEnd}
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
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal}>취소</Button>
                    <Button variant="primary" onClick={handleSubmit}>저장</Button>
                </Modal.Footer>
            </Modal>

            {/* =========================
                회사 위치 관리
            ========================= */}
            <Card className="p-3 mt-4 shadow-sm">
                <h3 className="mb-3">회사 위치 관리 (COMPANY_LOCATION)</h3>

                {locError && <Alert variant="danger">{locError}</Alert>}
                {locSuccess && <Alert variant="success">{locSuccess}</Alert>}

                <div className="d-flex gap-2 mb-3">
                    <Button onClick={() => openLocModal(null)}>+ 회사 위치 추가</Button>
                    <Button variant="outline-secondary" onClick={fetchLocations}>새로고침</Button>
                </div>

                <Table bordered hover responsive>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>회사명</th>
                        <th>주소</th>
                        <th>위도</th>
                        <th>경도</th>
                        <th>허용 반경(m)</th>
                        <th>활성</th>
                        <th>관리</th>
                    </tr>
                    </thead>
                    <tbody>
                    {locations.length === 0 ? (
                        <tr>
                            <td colSpan="8" className="text-center">등록된 위치가 없습니다.</td>
                        </tr>
                    ) : (
                        locations.map((l) => (
                            <tr key={l.locationId}>
                                <td>{l.locationId}</td>
                                <td>{l.companyName}</td>
                                <td>{l.address ?? "-"}</td>
                                <td>{l.latitude}</td>
                                <td>{l.longitude}</td>
                                <td>{l.allowedRadiusM}</td>
                                <td>{l.activeYn}</td>
                                <td className="d-flex gap-2">
                                    <Button size="sm" variant="outline-primary" onClick={() => openLocModal(l)}>
                                        수정
                                    </Button>
                                    <Button size="sm" variant="outline-danger" onClick={() => deleteLocation(l.locationId)}>
                                        삭제
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </Table>
            </Card>

            <Modal show={showLocModal} onHide={closeLocModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{editingLocId ? "회사 위치 수정" : "회사 위치 추가"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-2">
                            <Form.Label>회사명</Form.Label>
                            <Form.Control
                                type="text"
                                name="companyName"
                                value={locForm.companyName}
                                onChange={handleLocChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label>주소</Form.Label>
                            <Form.Control
                                type="text"
                                name="address"
                                value={locForm.address}
                                onChange={handleLocChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label>위도(latitude)</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.0000001"
                                name="latitude"
                                value={locForm.latitude}
                                onChange={handleLocChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label>경도(longitude)</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.0000001"
                                name="longitude"
                                value={locForm.longitude}
                                onChange={handleLocChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label>허용 반경(m)</Form.Label>
                            <Form.Control
                                type="number"
                                name="allowedRadiusM"
                                value={locForm.allowedRadiusM}
                                onChange={handleLocChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label>활성 여부</Form.Label>
                            <Form.Select
                                name="activeYn"
                                value={locForm.activeYn}
                                onChange={handleLocChange}
                            >
                                <option value="Y">Y</option>
                                <option value="N">N</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeLocModal}>취소</Button>
                    <Button variant="primary" onClick={submitLocation}>저장</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminWorkPolicy;
