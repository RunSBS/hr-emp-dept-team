import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Form, Button, Spinner, Alert } from "react-bootstrap";

const AdminAttendance = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    /* ===============================
       근태 목록 조회
    =============================== */
    const fetchAttendance = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get("/back/admin/attendance/list", {
                params: {
                    startDate,
                    endDate
                }
            });
            setRecords(res.data || []);
        } catch (e) {
            setError("근태 조회 실패");
        } finally {
            setLoading(false);
        }
    };

    /* 최초 로딩 */
    useEffect(() => {
        fetchAttendance();
    }, []);

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <h2 className="mb-4">관리자 근태 조회</h2>

            {/* 🔍 기간 필터 */}
            <Form className="d-flex gap-3 mb-3">
                <Form.Group>
                    <Form.Label>시작일</Form.Label>
                    <Form.Control
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </Form.Group>

                <Form.Group>
                    <Form.Label>종료일</Form.Label>
                    <Form.Control
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </Form.Group>

                <div className="d-flex align-items-end">
                    <Button onClick={fetchAttendance}>조회</Button>
                </div>
            </Form>

            {loading && <Spinner animation="border" />}
            {error && <Alert variant="danger">{error}</Alert>}

            {!loading && records.length > 0 && (
                <Table bordered hover>
                    <thead>
                    <tr>
                        <th>사번</th>
                        <th>이름</th>
                        <th>근무일</th>
                        <th>출근 시간</th>
                        <th>퇴근 시간</th>
                        <th>상태</th>
                        <th>근무 유형</th>
                        <th>총 근무(분)</th>
                    </tr>
                    </thead>
                    <tbody>
                    {records.map((r, idx) => (
                        <tr key={idx}>
                            <td>{r.empId}</td>
                            <td>{r.empName}</td>
                            <td>{r.workDate}</td>
                            <td>{r.checkIn ?? "-"}</td>
                            <td>{r.checkOut ?? "-"}</td>
                            <td>{r.workStatus}</td>
                            <td>{r.workType}</td>
                            <td>{r.totalWorkMinutes}</td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            )}

            {!loading && records.length === 0 && (
                <Alert variant="secondary">조회된 근태 기록이 없습니다.</Alert>
            )}
        </div>
    );
};

export default AdminAttendance;
