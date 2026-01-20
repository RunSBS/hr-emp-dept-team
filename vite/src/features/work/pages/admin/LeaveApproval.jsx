import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Spinner, Alert } from "react-bootstrap";

const LeaveApproval = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState(null);
    const [managerId, setManagerId] = useState(null);

    /* ===============================
       최초 로딩: 관리자 ID + 승인 대기 휴가 조회
    =============================== */
    useEffect(() => {
        fetchManagerAndLeaves();
    }, []);

    const fetchManagerAndLeaves = async () => {
        setLoading(true);
        setError(null);
        try {
            // 1️⃣ 로그인한 관리자 emp_id 조회
            const managerRes = await axios.get("/back/admin/leave-request/emp/current");
            setManagerId(managerRes.data.empId);

            // 2️⃣ 승인 대기 휴가 조회
            const leavesRes = await axios.get("/back/admin/leave-request/pending");
            setLeaves(leavesRes.data || []);
        } catch (e) {
            setError("승인 대기 휴가 조회 실패");
        } finally {
            setLoading(false);
        }
    };

    /* ===============================
       휴가 승인
    =============================== */
    const handleApprove = async (leaveId) => {
        if (!managerId) return alert("관리자 정보를 불러오는 중입니다.");
        setActionLoading(leaveId);
        try {
            await axios.put(`/back/admin/leave-request/${leaveId}/approve`, null, {
                params: { managerId },
            });
            fetchManagerAndLeaves(); // 목록 갱신
        } catch (e) {
            alert("승인 처리 실패");
        } finally {
            setActionLoading(null);
        }
    };

    /* ===============================
       휴가 반려
    =============================== */
    const handleReject = async (leaveId) => {
        if (!managerId) return alert("관리자 정보를 불러오는 중입니다.");
        setActionLoading(leaveId);
        try {
            await axios.put(`/back/admin/leave-request/${leaveId}/reject`, null, {
                params: { managerId },
            });
            fetchManagerAndLeaves(); // 목록 갱신
        } catch (e) {
            alert("반려 처리 실패");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <h2 className="mb-4">승인 대기 휴가 목록</h2>

            {loading && <Spinner animation="border" />}
            {error && <Alert variant="danger">{error}</Alert>}

            {!loading && leaves.length > 0 && (
                <Table bordered hover>
                    <thead>
                    <tr>
                        <th>사원 ID</th>
                        <th>휴가 종류</th>
                        <th>시작일</th>
                        <th>종료일</th>
                        <th>총 시간(분)</th>
                        <th>사유</th>
                        <th>처리</th>
                    </tr>
                    </thead>
                    <tbody>
                    {leaves.map((l) => (
                        <tr key={l.leaveId}>
                            <td>{l.employeeId}</td>
                            <td>{l.leaveTypeName}</td>
                            <td>{l.startDate}</td>
                            <td>{l.endDate}</td>
                            <td>{l.leaveMinutes}</td>
                            <td>{l.leaveReason}</td>
                            <td>
                                <Button
                                    size="sm"
                                    variant="success"
                                    className="me-2"
                                    onClick={() => handleApprove(l.leaveId)}
                                    disabled={actionLoading === l.leaveId}
                                >
                                    {actionLoading === l.leaveId ? "처리중..." : "승인"}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => handleReject(l.leaveId)}
                                    disabled={actionLoading === l.leaveId}
                                >
                                    {actionLoading === l.leaveId ? "처리중..." : "반려"}
                                </Button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            )}

            {!loading && leaves.length === 0 && (
                <Alert variant="secondary">승인 대기 중인 휴가가 없습니다.</Alert>
            )}
        </div>
    );
};

export default LeaveApproval;
