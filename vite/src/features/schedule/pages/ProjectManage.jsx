import { useEffect, useState } from "react";
import { useAuth } from "../../../main/AuthContext.jsx";
import axios from "axios";
import MemberViewModal from "../components/MemberViewModal.jsx";
import ProjectDetailModal from "../components/ProjectDetailModal.jsx";

import { Card, Button, Row, Col, Badge } from "react-bootstrap";
import "../styles/project.css";
import "../styles/projectManage.css"
const ProjectManage = () => {
    const { user } = useAuth();

    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [viewType, setViewType] = useState("");

    // 페이징
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // 🔍 검색
    const [searchText, setSearchText] = useState("");

    /* ================= 프로젝트 조회 ================= */
    const fetchProjects = async (pageNumber = 0) => {
        if (!user || !user.authenticated) return;

        try {
            const res = await axios.get("/back/project/my", {
                params: {
                    page: pageNumber,
                    size: 6,
                    keyword: searchText
                }
            });

            setProjects(res.data.content);
            setPage(res.data.number);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error(err);
        }
    };

    /* ================= 최초 + 페이징 ================= */
    useEffect(() => {
        fetchProjects(page);
    }, [user, page]);

    /* ================= 실시간 검색 ================= */
    useEffect(() => {
        setPage(0);
        fetchProjects(0);
    }, [searchText]);

    return (
        <div className="page-wrapper">

            {/* ===== 검색 영역 ===== */}
            <div className="content-wrapper">
                <h2>내 프로젝트 관리</h2>
                <div className="meeting-top-bar">
                    <div className="meeting-search-group">
                        <input
                            type="text"
                            className="meeting-search-input"
                            placeholder="프로젝트 이름 검색"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="section-gap" />

            {/* ===== 카드 영역 ===== */}
            <div className="content-wrapper">
                {projects.length === 0 ? (
                    <div className="empty-projects text-center py-5">
                        참여중인 프로젝트가 없습니다.
                    </div>
                ) : (
                    <>
                        <Row xs={1} md={2} lg={3} className="g-4">
                            {projects.map(p => (
                                <Col key={p.id}>
                                    <Card className="h-100 shadow-sm">
                                        <Card.Header className="d-flex justify-content-between align-items-center">
                                            <strong>{p.name}</strong>
                                            <div className="d-flex gap-2">
                                                <Badge bg="secondary" className="badge-beige">
                                                    {p.methodology}
                                                </Badge>
                                                <Badge bg="secondary" className="badge-beige">
                                                    {p.status}
                                                </Badge>

                                            </div>
                                        </Card.Header>

                                        <Card.Body>
                                            <Card.Text className="mb-3">
                                                {p.description}
                                            </Card.Text>

                                            <Row className="text-muted small">
                                                <Col>
                                                    <strong>내 역할</strong><br />
                                                    {p.role}
                                                </Col>
                                                <Col>
                                                    <strong>시작일</strong><br />
                                                    {p.startDate?.slice(0, 10)}
                                                </Col>
                                                <Col>
                                                    <strong>종료일</strong><br />
                                                    {p.endDate?.slice(0, 10)}
                                                </Col>
                                            </Row>
                                        </Card.Body>

                                        <Card.Footer className="bg-white border-0">
                                            <div className="d-flex justify-content-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => {
                                                        setSelectedProjectId(p.id);
                                                        setViewType("members");
                                                    }}
                                                >
                                                    참여자
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="fc-like-btn"
                                                    onClick={() => {
                                                        setSelectedProjectId(p.id);
                                                        setViewType("projectDetail");
                                                    }}
                                                >
                                                    프로젝트 보기
                                                </Button>
                                            </div>
                                        </Card.Footer>
                                    </Card>
                                </Col>
                            ))}
                        </Row>

                        {/* ===== 페이징 ===== */}
                        <div className="d-flex justify-content-center align-items-center mt-4 gap-3">
                            <Button
                                size="sm"
                                variant="secondary"
                                disabled={page === 0}
                                onClick={() => setPage(page - 1)}
                            >
                                이전
                            </Button>

                            <span>{page + 1} / {totalPages}</span>

                            <Button
                                size="sm"
                                variant="secondary"
                                disabled={page === totalPages - 1}
                                onClick={() => setPage(page + 1)}
                            >
                                다음
                            </Button>
                        </div>
                    </>
                )}
            </div>

            {/* ===== 참여자 모달 ===== */}
            {selectedProjectId && viewType === "members" && (
                <MemberViewModal
                    projectId={selectedProjectId}
                    onClose={() => setSelectedProjectId(null)}
                />
            )}

            {/* ===== 프로젝트 상세 모달 ===== */}
            {selectedProjectId && viewType === "projectDetail" && (
                <ProjectDetailModal
                    projectId={selectedProjectId}
                    onClose={() => setSelectedProjectId(null)}
                    projects={projects}
                />
            )}
        </div>
    );
};

export default ProjectManage;
