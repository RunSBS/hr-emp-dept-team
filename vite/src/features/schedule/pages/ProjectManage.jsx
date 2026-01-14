import { useEffect, useState } from "react";
import { useAuth } from "../../../main/AuthContext.jsx";
import axios from "axios";
import MemberViewModal from "../components/MemberViewModal.jsx";
import ProjectDetailModal from "../components/ProjectDetailModal.jsx";

import { Card, Button, Row, Col, Badge } from "react-bootstrap";

const ProjectManage = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [viewType, setViewType] = useState(""); // "members" | "projectDetail"

    useEffect(() => {
        if (user && user.authenticated) {
            axios.get("/back/project-members/my")
                .then(async res => {
                    const memberProjects = res.data;
                    const projectIds = memberProjects.map(p => p.projectId);

                    const detailRes = await axios.get(
                        `/back/project?ids=${projectIds.join(",")}`
                    );

                    const detailedProjects = memberProjects.map(pm => {
                        const projectDetail = detailRes.data.find(
                            p => p.id === pm.projectId
                        );
                        return {
                            ...projectDetail,
                            role: pm.role
                        };
                    });

                    setProjects(detailedProjects);
                })
                .catch(err => console.error(err));
        }
    }, [user]);

    return (
        <>
            <h1 className="mb-4">프로젝트 관리</h1>

            {projects.length === 0 ? (
                <p>참여중인 프로젝트가 없습니다.</p>
            ) : (
                <Row xs={1} md={2} lg={3} className="g-4">
                    {projects.map(p => (
                        <Col key={p.id}>
                            <Card className="h-100 shadow-sm">

                                {/* 상단: 제목 왼쪽 / 기법+상태 오른쪽 */}
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <strong>{p.name}</strong>

                                    <div className="d-flex gap-2">
                                        <Badge bg="secondary">
                                            {p.methodology}
                                        </Badge>
                                        <Badge bg="info">
                                            {p.status}
                                        </Badge>
                                    </div>
                                </Card.Header>

                                {/* 본문 */}
                                <Card.Body>
                                    <Card.Text className="mb-3">
                                        {p.description}
                                    </Card.Text>

                                    {/* 역할 / 날짜 가로 배치 */}
                                    <Row className="text-muted small">
                                        <Col>
                                            <strong>내 역할</strong><br />
                                            {p.role}
                                        </Col>
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

                                {/* 하단 버튼 */}
                                <Card.Footer className="bg-white border-0">
                                    <div className="d-flex justify-content-end gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline-primary"
                                            onClick={() => {
                                                setSelectedProjectId(p.id);
                                                setViewType("members");
                                            }}
                                        >
                                            참여자
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="primary"
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
            )}

            {/* 참여자 모달 */}
            {selectedProjectId && viewType === "members" && (
                <MemberViewModal
                    projectId={selectedProjectId}
                    onClose={() => setSelectedProjectId(null)}
                />
            )}

            {/* 프로젝트 상세 모달 */}
            {selectedProjectId && viewType === "projectDetail" && (
                <ProjectDetailModal
                    projectId={selectedProjectId}
                    onClose={() => setSelectedProjectId(null)}
                    projects={projects}
                />
            )}
        </>
    );
};

export default ProjectManage;
