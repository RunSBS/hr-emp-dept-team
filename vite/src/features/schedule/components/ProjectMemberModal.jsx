import { useEffect, useState } from "react";
import axios from "axios";
import { Card, Button, Table, Form, Row, Col } from "react-bootstrap";
import "../styles/projectMemberModal.css";
import "../styles/project.css"
const ProjectMemberModal = ({ projectId, onClose }) => {
    const [members, setMembers] = useState([]);
    const [form, setForm] = useState({
        empId: "",
        role: ""
    });

    const fetchMembers = async () => {
        const res = await axios.get(`/back/project-members/${projectId}`);
        setMembers(res.data);
    };

    const ROLE_OPTIONS = [
        { value: "PM", label: "PM (Project Manager)" },
        { value: "PL", label: "PL (Project Leader)" },
        { value: "FE", label: "FE (Frontend)" },
        { value: "BE", label: "BE (Backend)" },
        { value: "AI", label: "AI Engineer" }
    ];


    useEffect(() => {
        if (projectId) fetchMembers();
    }, [projectId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const addMember = async () => {
        try {
            await axios.post("/back/project-members", {
                projectId,
                empId: form.empId,
                role: form.role
            });
            setForm({ empId: "", role: "" });
            fetchMembers();
        } catch (e) {
            if (e.response) {
                alert(e.response.data.message || "이미 프로젝트에 참여한 사원입니다.");
            } else {
                alert("서버와 통신할 수 없습니다.");
            }
        }
    };

    const handleRoleChange = (id, value) => {
        setMembers(prev =>
            prev.map(m =>
                m.id === id ? { ...m, role: value } : m
            )
        );
    };

    const updateMember = async (id) => {
        const member = members.find(m => m.id === id);
        if (!member) return;

        await axios.put(`/back/project-members/${id}/role`, {
            role: member.role
        });

        alert("역할이 수정되었습니다");
    };

    const deleteMember = async (id) => {
        if (!window.confirm("삭제하시겠습니까?")) return;
        await axios.delete(`/back/project-members/${id}`);
        fetchMembers();
    };

    return (
        <div className="pm-overlay">
            <div className="pm-modal">
                <div className="pm-header">
                    <h3>프로젝트 참여자 관리</h3>
                    <Button variant="outline-secondary" size="sm" onClick={onClose}>
                        ✕
                    </Button>
                </div>

                {/* 참여자 추가 */}
                <Card className="mb-4 shadow-sm">
                    <Card.Body>
                        <Card.Title className="mb-3">참여자 추가</Card.Title>
                        <Row className="g-2">
                            <Col md={4}>
                                <Form.Control
                                    placeholder="사원 ID"
                                    name="empId"
                                    value={form.empId}
                                    onChange={handleChange}
                                />
                            </Col>
                            <Col md={4}>
                                <Form.Select
                                    name="role"
                                    value={form.role}
                                    onChange={handleChange}
                                >
                                    <option value="">역할 선택</option>
                                    {ROLE_OPTIONS.map(r => (
                                        <option key={r.value} value={r.value}>
                                            {r.label}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Col>

                            <Col md={4}>
                                <Button className="w-100 fc-like-btn" onClick={addMember}>
                                    추가
                                </Button>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* 멤버 목록 */}
                <Card className="shadow-sm">
                    <Card.Body>
                        <Card.Title className="mb-3">참여자 목록</Card.Title>

                        <Table bordered hover responsive>
                            <thead className="table-light">
                            <tr>
                                <th>사원 ID</th>
                                <th>이름</th>
                                <th>이메일</th>
                                <th style={{ width: "150px" }}>역할</th>
                                <th style={{ width: "140px" }}>관리</th>
                            </tr>
                            </thead>
                            <tbody>
                            {members.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center text-muted">
                                        참여자가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                members.map(m => (
                                    <tr key={m.id}>
                                        <td>{m.empId}</td>
                                        <td>{m.empName}</td>
                                        <td>{m.empEmail}</td>
                                        <td>
                                            <Form.Select
                                                size="sm"
                                                value={m.role}
                                                onChange={(e) =>
                                                    handleRoleChange(m.id, e.target.value)
                                                }
                                            >
                                                {ROLE_OPTIONS.map(r => (
                                                    <option key={r.value} value={r.value}>
                                                        {r.label}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </td>

                                        <td className="text-center">
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => updateMember(m.id)}
                                            >
                                                수정
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                className="ms-2"
                                                onClick={() => deleteMember(m.id)}
                                            >
                                                삭제
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
};

export default ProjectMemberModal;
