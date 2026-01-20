import React, { useEffect, useState } from "react";
import { Card, Table, Tabs, Tab, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../main/AuthContext";

const PAGE_SIZE = 10;

const Pending = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const empId = user?.empId;

    const [activeTab, setActiveTab] = useState("approver");

    const [approverList, setApproverList] = useState([]);
    const [requesterList, setRequesterList] = useState([]);

    const [approverPage, setApproverPage] = useState(0);
    const [requesterPage, setRequesterPage] = useState(0);

    const [loading, setLoading] = useState(true);

    if (!empId) return null;

    useEffect(() => {
        setLoading(true);

        Promise.all([
            fetch(
                `/back/ho/approvals/pending/approve?empId=${empId}&page=${approverPage}&size=${PAGE_SIZE}`,
                { credentials: "include" }
            ).then(res => res.json()),

            fetch(
                `/back/ho/approvals/pending/request?empId=${empId}&page=${requesterPage}&size=${PAGE_SIZE}`,
                { credentials: "include" }
            ).then(res => res.json())
        ])
            .then(([approverData, requesterData]) => {
                setApproverList(
                    (approverData || []).sort(
                        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                    )
                );

                setRequesterList(
                    (requesterData || []).sort(
                        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                    )
                );

                setLoading(false);
            })
            .catch(() => {
                setApproverList([]);
                setRequesterList([]);
                setLoading(false);
            });
    }, [empId, approverPage, requesterPage]);

    const renderStatus = (status) => {
        switch (status) {
            case "WAIT": return <Badge bg="warning">대기</Badge>;
            case "APPROVED": return <Badge bg="success">승인</Badge>;
            case "REJECTED": return <Badge bg="danger">반려</Badge>;
            case "CANCELLED": return <Badge bg="secondary">취소</Badge>;
            default: return <Badge bg="secondary">{status}</Badge>;
        }
    };

    const renderTable = (list) => (
        <Table hover>
            <thead>
            <tr>
                <th>문서번호</th>
                <th>제목</th>
                <th>상태</th>
                <th>신청일</th>
            </tr>
            </thead>
            <tbody>
            {list.length === 0 ? (
                <tr>
                    <td colSpan="4" className="text-center">문서가 없습니다.</td>
                </tr>
            ) : (
                list.map(item => (
                    <tr
                        key={item.approvalId}
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/main/approval/detail/${item.approvalId}`)}
                    >
                        <td>{item.approvalId}</td>
                        <td>{item.title}</td>
                        <td>{renderStatus(item.status)}</td>
                        <td>{item.createdAt}</td>
                    </tr>
                ))
            )}
            </tbody>
        </Table>
    );

    const renderPaging = (page, setPage, list) => (
        <div className="d-flex justify-content-center gap-2 mt-3">
            <button
                className="btn btn-sm btn-outline-secondary"
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(p - 1, 0))}
            >
                이전
            </button>
            <span>{page + 1}</span>
            <button
                className="btn btn-sm btn-outline-secondary"
                disabled={list.length < PAGE_SIZE}
                onClick={() => setPage(p => p + 1)}
            >
                다음
            </button>
        </div>
    );

    return (
        <Card>
            <Card.Header>결재 대기</Card.Header>
            <Card.Body>
                {loading ? (
                    <div>로딩중...</div>
                ) : (
                    <Tabs
                        activeKey={activeTab}
                        onSelect={(k) => {
                            setActiveTab(k);
                            setApproverPage(0);
                            setRequesterPage(0);
                        }}
                        className="mb-3"
                    >
                        <Tab eventKey="approver" title="결재해야 할 문서">
                            {renderTable(approverList)}
                            {renderPaging(approverPage, setApproverPage, approverList)}
                        </Tab>

                        <Tab eventKey="requester" title="결재 대기중인 문서">
                            {renderTable(requesterList)}
                            {renderPaging(requesterPage, setRequesterPage, requesterList)}
                        </Tab>
                    </Tabs>
                )}
            </Card.Body>
        </Card>
    );
};

export default Pending;