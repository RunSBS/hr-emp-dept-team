import React, { useEffect, useMemo, useState } from "react";
import "../../styles/LeaderAttendance.css";
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

    // ✅ Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const totalPages = Math.ceil(records.length / pageSize) || 1;
    const startIdx = (currentPage - 1) * pageSize;
    const pageRecords = records.slice(startIdx, startIdx + pageSize);

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
            const data = res.data || [];
            setRecords(data);

            // ✅ 조회하면 페이지는 1로 리셋
            setCurrentPage(1);
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

    // ✅ 페이지 버튼 목록(1 ... n)
    const getPageButtons = () => {
        if (totalPages <= 1) return [];

        const buttons = [];
        const maxVisible = 6; // 1 2 3 4 5 6 ... 형태
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = start + maxVisible - 1;

        if (end > totalPages) {
            end = totalPages;
            start = Math.max(1, end - maxVisible + 1);
        }

        // 첫 페이지
        if (start > 1) {
            buttons.push(1);
            if (start > 2) buttons.push("ellipsis-left");
        }

        for (let i = start; i <= end; i++) buttons.push(i);

        // 마지막 페이지
        if (end < totalPages) {
            if (end < totalPages - 1) buttons.push("ellipsis-right");
            buttons.push(totalPages);
        }

        return buttons;
    };

    return (
        <div className="leader-attendance">
            {/* ===== Header ===== */}
            <div className="la-header">
                <h2 className="la-title">리더 근태 조회</h2>
                <p className="la-subtitle">
                    팀원 근태를 기간/이름으로 조회할 수 있습니다. (조회 전용)
                </p>
            </div>

            {/* ===== Filter ===== */}
            <div className="la-card la-filter">
                <Form className="la-filter-form d-flex flex-wrap gap-3">
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
            </div>

            {/* ===== Loading / Alerts ===== */}
            {loading && (
                <div className="la-loading">
                    <Spinner animation="border" size="sm" className="me-2" />
                    불러오는 중...
                </div>
            )}

            {error && (
                <Alert className="la-alert" variant="danger">
                    {error}
                </Alert>
            )}

            {/* ===== Table ===== */}
            {!loading && records.length > 0 && (
                <div className="la-card la-table-wrap">
                    <Table bordered hover responsive className="la-table">
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
                        {pageRecords.map((r, idx) => (
                            <tr key={`${r.empId}_${r.workDate}_${idx}`}>
                                <td>{r.empId}</td>
                                <td>{r.empName}</td>
                                <td>{r.workDate}</td>
                                <td>{r.checkIn ?? "-"}</td>
                                <td>{r.checkOut ?? "-"}</td>

                                <td>
                                        <span
                                            className={`la-badge la-status la-status-${String(
                                                r.workStatus || ""
                                            ).toLowerCase()}`}
                                        >
                                            {r.workStatus}
                                        </span>
                                </td>

                                <td>
                                        <span
                                            className={`la-badge la-type la-type-${String(
                                                r.workType || ""
                                            ).toLowerCase()}`}
                                        >
                                            {r.workType}
                                        </span>
                                </td>

                                <td>{r.totalWorkMinutes}</td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>

                    {/* ===== Pagination ===== */}
                    {totalPages > 1 && (
                        <div className="la-pagination">
                            <button
                                className="la-page-btn"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                type="button"
                            >
                                ‹
                            </button>

                            {getPageButtons().map((b, i) => {
                                if (String(b).includes("ellipsis")) {
                                    return (
                                        <span className="la-page-ellipsis" key={`${b}_${i}`}>
                                            …
                                        </span>
                                    );
                                }
                                return (
                                    <button
                                        key={b}
                                        className={`la-page-btn ${currentPage === b ? "active" : ""}`}
                                        onClick={() => setCurrentPage(b)}
                                        type="button"
                                    >
                                        {b}
                                    </button>
                                );
                            })}

                            <button
                                className="la-page-btn"
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                type="button"
                            >
                                ›
                            </button>
                        </div>
                    )}
                </div>
            )}

            {!loading && records.length === 0 && (
                <Alert className="la-alert" variant="secondary">
                    조회된 근태 기록이 없습니다.
                </Alert>
            )}
        </div>
    );
};

export default LeaderAttendance;
