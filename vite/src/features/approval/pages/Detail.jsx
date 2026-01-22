import React, { useEffect, useState } from "react";
import { Card, Badge, Button, ListGroup, Row, Col, Form } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../main/AuthContext";

const Detail = () => {
    const { approvalId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/back/ho/approvals/${approvalId}`, { credentials: "include" })
            .then(res => res.json())
            .then(data => {
                setDetail(data);
                setLoading(false);
            })
            .catch(() => {
                setDetail(null);
                setLoading(false);
            });
    }, [approvalId]);

    useEffect(() => {
        if (detail) {
            console.log("detail.files =", detail.files);
        }
    }, [detail]);

    const renderStatus = (status) => {
        switch (status) {
            case "WAIT": return <Badge bg="warning">대기</Badge>;
            case "APPROVED": return <Badge bg="success">승인</Badge>;
            case "REJECTED": return <Badge bg="danger">반려</Badge>;
            case "CANCELLED": return <Badge bg="secondary">취소</Badge>;
            default: return <Badge bg="secondary">{status}</Badge>;
        }
    };

    const loginEmpId = user?.empId;
    const requestEmpId = detail?.empId;
    const currentLine = detail?.lines?.find(line => line.current);
    const isCurrentApprover = currentLine?.empId === loginEmpId;
    const isRequester = requestEmpId === loginEmpId;

    const handleApprove = async () => {
        const res = await fetch(`/back/ho/approvals/${approvalId}/approve`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ empId: loginEmpId, comment: "승인 처리" })
        });
        if (res.ok) {
            alert("승인되었습니다.");
            navigate("/main/approval/pending");
        }
    };

    const handleReject = async () => {
        const comment = prompt("반려 사유를 입력하세요");
        if (!comment) return;
        const res = await fetch(`/back/ho/approvals/${approvalId}/reject`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ empId: loginEmpId, comment })
        });
        if (res.ok) {
            alert("반려되었습니다.");
            navigate("/main/approval/pending");
        }
    };

    const handleCancel = async () => {
        if (!window.confirm("결재를 취소하시겠습니까?")) return;
        const res = await fetch(`/back/ho/approvals/${approvalId}/cancel`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ empId: loginEmpId, comment: "기안자 취소" })
        });
        if (res.ok) {
            alert("결재가 취소되었습니다.");
            navigate("/main/approval/pending");
        }
    };

    if (loading) return <div>로딩중...</div>;
    if (!detail) return <div>문서를 찾을 수 없습니다.</div>;

    return (
        <Card>
            <Card.Header>
                <Row className="align-items-center">
                    <Col>
                        <strong>{detail.title}</strong> {renderStatus(detail.status)}
                    </Col>
                </Row>
            </Card.Header>

            <Card.Body>
                <Row>
                    {/* 왼쪽 영역 */}
                    <Col md={8}>
                        <Form.Group className="mb-3">
                            <Form.Label>결재 유형</Form.Label>
                            <Form.Control
                                value={detail.typeDescription || detail.typeName || ""}
                                readOnly
                                style={{ backgroundColor: "#f8f9fa", fontWeight: 500 }}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>내용</Form.Label>
                            <Form.Control
                                as="textarea"
                                value={detail.content}
                                readOnly
                                style={{ minHeight: "300px", resize: "vertical" }}
                            />
                        </Form.Group>

                        {/*  첨부파일  */}
                        <Form.Group className="mb-3">
                            <Form.Label>첨부파일</Form.Label>

                            {Array.isArray(detail.files) && detail.files.length > 0 ? (
                                <ListGroup>
                                    {detail.files.map((file, index) => (
                                        <ListGroup.Item
                                            key={index}
                                            className="d-flex justify-content-between align-items-center"
                                        >
                                            <span>{file.fileName}</span>

                                            <Button
                                                size="sm"
                                                variant="outline-primary"
                                                href={`/back/ho/approvals/files/download?path=${encodeURIComponent(file.filePaths)}`}
                                            >
                                                다운로드
                                            </Button>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : (
                                <div className="text-muted">첨부파일 없음</div>
                            )}
                        </Form.Group>



                    </Col>

                    {/* 결재선 */}
                    <Col md={4}>
                        <h6>결재선</h6>
                        <ListGroup>
                            {detail.lines.map(line => (
                                <ListGroup.Item
                                    key={line.lineId}
                                    className="d-flex justify-content-between align-items-center"
                                    style={{
                                        backgroundColor: line.current ? "#e3f2fd" : "#f8f9fa"
                                    }}
                                >
                                    <span>{line.stepOrder}차: {line.empName}</span>
                                    {line.current && <strong className="text-primary">현재</strong>}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Col>
                </Row>

                {/* 액션 버튼 */}
                {detail.status === "WAIT" && (
                    <div className="mt-3 d-flex justify-content-end gap-2">
                        {isCurrentApprover && (
                            <>
                                <Button variant="success" onClick={handleApprove}>승인</Button>
                                <Button variant="danger" onClick={handleReject}>반려</Button>
                            </>
                        )}
                        {isRequester && (
                            <Button variant="secondary" onClick={handleCancel}>취소</Button>
                        )}
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default Detail;
