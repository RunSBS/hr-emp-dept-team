import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Table, Form, Button, Spinner, Alert, InputGroup } from "react-bootstrap";

const LeaderAttendance = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [empName, setEmpName] = useState("");

    const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

    // ✅ 종료일 < 시작일 자동 보정
    useEffect(() => {
        if (startDate && endDate && endDate < startDate) {
            setEndDate(startDate);
        }
    }, [startDate, endDate]);

    const getErrorMessage = (err, fallback) =>
        err?.response?.data?.message || err?.response?.data?.error || fallback;

    const fetchAttendance = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await axios.get("/back/leader/attendance/list", {
                params: {
                    startDate,
                    endDate,
                    empName: empName?.trim() || undefined,
                },
            });
            setRecords(res.data || []);
        } catch (e) {
            setError(getErrorMessage(e, "근태 조회 실패"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <h2 className="mb-4">리더 근태 조회 (조회 전용)</h2>

            <Form className="d-flex flex-wrap gap-3 mb-3">
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
                        min={startDate || undefined}
                        max={todayStr}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </Form.Group>

                <Form.Group style={{ minWidth: "260px" }}>
                    <Form.Label>이름 검색</Form.Label>
                    <InputGroup>
                        <Form.Control
                            placeholder="이름(부분검색 가능)"
                            value={empName}
                            onChange={(e) => setEmpName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    fetchAttendance();
                                }
                            }}
                        />
                        <Button variant="outline-secondary" onClick={() => setEmpName("")}>
                            초기화
                        </Button>
                    </InputGroup>
                </Form.Group>

                <div className="d-flex align-items-end">
                    <Button onClick={fetchAttendance} disabled={loading}>
                        {loading ? "조회 중..." : "조회"}
                    </Button>
                </div>
            </Form>

            {loading && (
                <div className="mb-3">
                    <Spinner animation="border" size="sm" className="me-2" />
                    불러오는 중...
                </div>
            )}
            {error && <Alert variant="danger">{error}</Alert>}

            {!loading && records.length > 0 && (
                <Table bordered hover responsive>
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

export default LeaderAttendance;
