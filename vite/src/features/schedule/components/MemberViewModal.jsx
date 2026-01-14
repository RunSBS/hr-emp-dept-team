import { useEffect, useState } from "react";
import axios from "axios";
import { Card, Table, Button } from "react-bootstrap";
import "../styles/memberViewModal.css"; // CSS 파일

const MemberViewModal = ({ projectId, onClose }) => {
    const [members, setMembers] = useState([]);

    useEffect(() => {
        if (projectId) {
            axios
                .get(`/back/project-members/${projectId}`)
                .then(res => setMembers(res.data))
                .catch(err => console.error(err));
        }
    }, [projectId]);

    return (
        <div className="mv-overlay">
            <div className="mv-modal">
                <div className="mv-header">
                    <h3>참여자 목록</h3>
                    <Button variant="outline-secondary" size="sm" onClick={onClose}>
                        ✕
                    </Button>
                </div>

                <Card className="shadow-sm">
                    <Card.Body>
                        {members.length === 0 ? (
                            <p className="text-center text-muted">참여자가 없습니다.</p>
                        ) : (
                            <Table bordered hover responsive className="mb-0">
                                <thead className="table-light">
                                <tr>
                                    <th>사원 ID</th>
                                    <th>이름</th>
                                    <th>이메일</th>
                                    <th>역할</th>
                                </tr>
                                </thead>
                                <tbody>
                                {members.map(m => (
                                    <tr key={m.id}>
                                        <td>{m.empId}</td>
                                        <td>{m.empName}</td>
                                        <td>{m.empEmail}</td>
                                        <td>{m.role}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                        )}
                    </Card.Body>
                </Card>

                <div className="mv-footer">
                    <Button onClick={onClose}>닫기</Button>
                </div>
            </div>
        </div>
    );
};

export default MemberViewModal;
