import React, { useEffect, useState } from "react";
import { Card, Badge, Button, ListGroup } from "react-bootstrap";
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

    const renderStatus = (status) => {
        switch (status) {
            case "WAIT": return <Badge bg="warning">대기</Badge>;
            case "APPROVED": return <Badge bg="success">승인</Badge>;
            case "REJECTED": return <Badge bg="danger">반려</Badge>;
            case "CANCELLED": return <Badge bg="secondary">취소</Badge>;
            default: return <Badge bg="secondary">{status}</Badge>;
        }
    };

    /* ==========================
       권한 판단 (정상 구조)
    ========================== */
    const loginEmpId = user?.empId;          // 로그인 사용자
    const requestEmpId = detail?.empId;      // 기안자

    const currentLine = detail?.lines?.find(line => line.current);
    const isCurrentApprover = currentLine?.empId === loginEmpId;
    const isRequester = requestEmpId === loginEmpId;

    /* ==========================
       액션 핸들러
    ========================== */
    const handleApprove = async () => {
        const res = await fetch(`/back/ho/approvals/${approvalId}/approve`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                empId: loginEmpId,
                comment: "승인 처리"
            })
        });

        if (res.ok) {
            alert("승인되었습니다.");
            navigate("/main/approval/pending");
        } else {
            const text = await res.text();
            alert("승인 실패: " + text);
        }
    };

    const handleReject = async () => {
        const comment = prompt("반려 사유를 입력하세요");
        if (!comment) return;

        const res = await fetch(`/back/ho/approvals/${approvalId}/reject`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                empId: loginEmpId,  // ✅ 여기에 추가
                comment
            })
        });

        if (res.ok) {
            alert("반려되었습니다.");
            navigate("/main/approval/pending");
        } else {
            alert("반려 실패: 권한이 없거나 이미 처리된 문서입니다.");
        }
    };


    const handleCancel = async () => {
        const ok = window.confirm("결재를 취소하시겠습니까?");
        if (!ok) return;

        const res = await fetch(`/back/ho/approvals/${approvalId}/cancel`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                empId: loginEmpId,          // ✅ 반드시 필요
                comment: "기안자 취소"
            })
        });

        if (res.ok) {
            alert("결재가 취소되었습니다.");
            navigate("/main/approval/pending");
        } else {
            const text = await res.text();
            alert("취소 실패: " + text);
        }
    };


    /* ==========================
       Render
    ========================== */
    if (loading) return <div>로딩중...</div>;
    if (!detail) return <div>문서를 찾을 수 없습니다.</div>;

    return (
        <Card>
            <Card.Header>
                <strong>{detail.title}</strong> {renderStatus(detail.status)}
            </Card.Header>

            <Card.Body>
                <p>{detail.content}</p>

                <h6>결재선</h6>
                <ListGroup className="mb-3">
                    {detail.lines.map(line => (
                        <ListGroup.Item key={line.lineId}>
                            {line.stepOrder}차 결재자 : {line.empName}
                            {line.current && <strong> (현재 결재자)</strong>}
                        </ListGroup.Item>
                    ))}
                </ListGroup>

                {detail.status === "WAIT" && (
                    <div>
                        {/* 승인 / 반려 → 현재 결재자만 */}
                        {isCurrentApprover && (
                            <>
                                <Button
                                    variant="success"
                                    className="me-2"
                                    onClick={handleApprove}
                                >
                                    승인
                                </Button>
                                <Button
                                    variant="danger"
                                    className="me-2"
                                    onClick={handleReject}
                                >
                                    반려
                                </Button>
                            </>
                        )}

                        {/* 취소 → 기안자만 */}
                        {isRequester && (
                            <Button
                                variant="secondary"
                                onClick={handleCancel}
                            >
                                취소
                            </Button>
                        )}
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default Detail;
