import { useEffect, useState } from "react";
import axios from "axios";
import ProjectMemberModal from "../components/ProjectMemberModal.jsx";
import ProjectFormModal from "../components/ProjectFormModal.jsx";

import { Card, Button, Row, Col, Badge } from "react-bootstrap";

const Project = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);

    // 🔹 생성 / 수정 모달 상태
    const [showFormModal, setShowFormModal] = useState(false);
    const [mode, setMode] = useState("create"); // "create" | "edit"
    const [editId, setEditId] = useState(null);

    const [form, setForm] = useState({
        name: "",
        description: "",
        methodology: "",
        startDate: "",
        endDate: "",
        status: ""
    });

    /* ================= 최초 조회 ================= */
    useEffect(() => {
        axios.get("/back/project")
            .then(res => setProjects(res.data))
            .catch(err => console.error(err));
    }, []);

    /* ================= 공통 ================= */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    /* ================= 생성 ================= */
    const openCreateModal = () => {
        setMode("create");
        setEditId(null);
        setForm({
            name: "",
            description: "",
            methodology: "",
            startDate: "",
            endDate: "",
            status: ""
        });
        setShowFormModal(true);
    };

    /* ================= 수정 ================= */
    const openEditModal = (p) => {
        setMode("edit");
        setEditId(p.id);
        setForm({
            name: p.name,
            description: p.description,
            methodology: p.methodology,
            startDate: p.startDate ?? "",
            endDate: p.endDate ?? "",
            status: p.status
        });
        setShowFormModal(true);
    };

    /* ================= 저장 (생성/수정 통합) ================= */
    const handleSubmit = async () => {
        try {
            if (mode === "create") {
                const res = await axios.post("/back/project", form);
                setProjects(prev => [...prev, res.data]);
            } else {
                await axios.put(`/back/project/${editId}`, form);
                setProjects(prev =>
                    prev.map(p =>
                        p.id === editId ? { ...p, ...form } : p
                    )
                );
            }

            setShowFormModal(false);
        } catch (e) {
            console.error(e);
            alert(mode === "create" ? "생성 실패" : "수정 실패");
        }
    };

    /* ================= 삭제 ================= */
    const handleDelete = async (id) => {
        if (!window.confirm("삭제하시겠습니까?")) return;
        try {
            await axios.delete(`/back/project/${id}`);
            setProjects(prev => prev.filter(p => p.id !== id));
        } catch (e) {
            console.error(e);
            alert("삭제 실패");
        }
    };

    return (
        <>
            <h1 className="mb-4">Project</h1>

            {/* 상단 버튼 */}
            <div className="mb-3">
                <Button onClick={openCreateModal}>새 프로젝트 생성</Button>
            </div>

            {/* 프로젝트 카드 목록 */}
            <Row xs={1} md={2} lg={3} className="g-4">
                {projects.map(p => (
                    <Col key={p.id}>
                        <Card className="h-100 shadow-sm">
                            <Card.Header className="d-flex justify-content-between align-items-center">
                                <strong>{p.name}</strong>
                                <div className="d-flex gap-2">
                                    <Badge bg="secondary">{p.methodology}</Badge>
                                    <Badge bg="info">{p.status}</Badge>
                                </div>
                            </Card.Header>

                            <Card.Body>
                                <Card.Text>{p.description}</Card.Text>

                                <Row className="text-muted small">
                                    <Col>
                                        <strong>시작일</strong><br />
                                        {p.startDate}
                                    </Col>
                                    <Col>
                                        <strong>종료일</strong><br />
                                        {p.endDate}
                                    </Col>
                                </Row>
                            </Card.Body>

                            <Card.Footer className="bg-white border-0">
                                <div className="d-flex justify-content-end gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline-secondary"
                                        onClick={() => openEditModal(p)}
                                    >
                                        수정
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline-danger"
                                        onClick={() => handleDelete(p.id)}
                                    >
                                        삭제
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="primary"
                                        onClick={() => setSelectedProjectId(p.id)}
                                    >
                                        참여자
                                    </Button>
                                </div>
                            </Card.Footer>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* 참여자 모달 */}
            {selectedProjectId && (
                <ProjectMemberModal
                    projectId={selectedProjectId}
                    onClose={() => setSelectedProjectId(null)}
                />
            )}

            {/* 생성 / 수정 공용 모달 */}
            <ProjectFormModal
                show={showFormModal}
                mode={mode}
                form={form}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onClose={() => setShowFormModal(false)}
            />
        </>
    );
};

export default Project;
