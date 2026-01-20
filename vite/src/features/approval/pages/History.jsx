import React, { useEffect, useState } from "react";
import { Card, Table, Tabs, Tab, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../main/AuthContext";

const PAGE_SIZE = 10;

const History = () => {
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

        fetch(
            `/back/ho/approvals/history?empId=${empId}&page=${Math.min(approverPage, requesterPage)}&size=${PAGE_SIZE}`,
            { credentials: "include" }
        )
            .then(res => res.json())
            .then(data => {
                const list = Array.isArray(data) ? data : [];

                const requester = list
                    .filter(item => item.empId === empId)
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                const approver = list
                    .filter(item =>
                        item.empId !== empId &&
                        item.lines?.some(line => String(line.empId) === String(empId))
                    )
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));


                setRequesterList(
                    requester.slice(
                        requesterPage * PAGE_SIZE,
                        requesterPage * PAGE_SIZE + PAGE_SIZE
                    )
                );

                setApproverList(
                    approver.slice(
                        approverPage * PAGE_SIZE,
                        approverPage * PAGE_SIZE + PAGE_SIZE
                    )
                );

                setLoading(false);
            })
            .catch(() => {
                setRequesterList([]);
                setApproverList([]);
                setLoading(false);
            });
    }, [empId, approverPage, requesterPage]);

    const renderStatus = (status) => {
        switch (status) {
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
            <span className="align-self-center">{page + 1}</span>
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
            <Card.Header>결재 이력</Card.Header>
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
                        <Tab eventKey="approver" title="내가 결재한 문서">
                            {renderTable(approverList)}
                            {renderPaging(approverPage, setApproverPage, approverList)}
                        </Tab>

                        <Tab eventKey="requester" title="내가 기안한 문서">
                            {renderTable(requesterList)}
                            {renderPaging(requesterPage, setRequesterPage, requesterList)}
                        </Tab>
                    </Tabs>
                )}
            </Card.Body>
        </Card>
    );
};

export default History;
