import { useEffect, useState } from "react";
import axios from "axios";
import ProjectMemberModal from "../components/ProjectMemberModal.jsx";
import ProjectFormModal from "../components/ProjectFormModal.jsx";

import { Card, Button, Row, Col, Badge } from "react-bootstrap";

const Project = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);

    // 🔹 페이징
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // 🔹 검색어
    const [searchText, setSearchText] = useState("");

    // 🔹 생성 / 수정 모달
    const [showFormModal, setShowFormModal] = useState(false);
    const [mode, setMode] = useState("create");
    const [editId, setEditId] = useState(null);

    const [form, setForm] = useState({
        name: "",
        description: "",
        methodology: "",
        startDate: "",
        endDate: "",
        status: ""
    });

    /* ================= 프로젝트 조회 (페이징 + 검색) ================= */
    const fetchProjects = async (pageNumber = 0, keyword = searchText) => {
        try {
            const res = await axios.get("/back/project", {
                params: {
                    page: pageNumber,
                    size: 6,
                    keyword: keyword
                }
            });

            setProjects(res.data.content);
            setPage(res.data.number);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error(err);
        }
    };

    /* ================= 최초 조회 ================= */
    useEffect(() => {
        fetchProjects(0);
    }, []);

    /* ================= 실시간 검색 ================= */
    useEffect(() => {
        // 검색어 바뀌면 항상 첫 페이지부터
        fetchProjects(0, searchText);
    }, [searchText]);

    /* ================= 입력 ================= */
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

    /* ================= 저장 ================= */
    const handleSubmit = async () => {
        try {
            if (mode === "create") {
                await axios.post("/back/project", form);
            } else {
                await axios.put(`/back/project/${editId}`, form);
            }

            setShowFormModal(false);
            fetchProjects(page);
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

            if (projects.length === 1 && page > 0) {
                fetchProjects(page - 1);
            } else {
                fetchProjects(page);
            }
        } catch (e) {
            console.error(e);
            alert("삭제 실패");
        }
    };

    return (
        <>


            {/* 🔹 상단 검색 + 생성 */}
            <div className="meeting-top-bar mb-4">
                <div className="meeting-search-group">
                    <input
                        type="text"
                        className="meeting-search-input"
                        placeholder="프로젝트 이름 검색"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <Button onClick={openCreateModal}>
                        새 프로젝트 생성
                    </Button>
                </div>
            </div>

            {/* 🔹 프로젝트 카드 */}
            <div className="meeting-room-wrapper">
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
            </div>

            {/* 🔹 페이지네이션 */}
            <div className="d-flex justify-content-center align-items-center mt-4 gap-3">
                <Button
                    size="sm"
                    variant="outline-secondary"
                    disabled={page === 0}
                    onClick={() => fetchProjects(page - 1)}
                >
                    이전
                </Button>

                <span>{page + 1} / {totalPages}</span>

                <Button
                    size="sm"
                    variant="outline-secondary"
                    disabled={page === totalPages - 1}
                    onClick={() => fetchProjects(page + 1)}
                >
                    다음
                </Button>
            </div>

            {/* 참여자 모달 */}
            {selectedProjectId && (
                <ProjectMemberModal
                    projectId={selectedProjectId}
                    onClose={() => setSelectedProjectId(null)}
                />
            )}

            {/* 생성 / 수정 모달 */}
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
