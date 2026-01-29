import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/Attendance.css";
import { Button, Card, Alert, Spinner, Table, Form } from "react-bootstrap";

const Attendance = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // 오늘 상태
    const [hasCheckedIn, setHasCheckedIn] = useState(false);
    const [hasCheckedOut, setHasCheckedOut] = useState(false);
    const [todayStatus, setTodayStatus] = useState(null);

    // 근태 내역
    const [records, setRecords] = useState([]);

    // 조회 기간
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const todayStr = new Date().toISOString().slice(0, 10);

    // ✅ 페이지네이션
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // ✅ 현재 페이지 데이터 슬라이스
    const totalPages = Math.max(1, Math.ceil(records.length / pageSize));
    const pageRecords = records.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    /* ===============================
       오늘 출근/퇴근 상태 조회
    =============================== */
    const fetchTodayStatus = async () => {
        try {
            const res = await axios.get("/back/work/status");
            setHasCheckedIn(!!res.data.checkedIn);
            setHasCheckedOut(!!res.data.checkedOut);
            setTodayStatus(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchTodayStatus();
    }, []);

    useEffect(() => {
        if (startDate && endDate && endDate < startDate) {
            setEndDate(startDate);
        }
    }, [startDate, endDate]);

    /* ===============================
       나의 근태 조회
    =============================== */
    const fetchMyAttendance = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get("/back/work/my", {
                params: { startDate, endDate },
            });
            setRecords(res.data || []);
            setCurrentPage(1); // ✅ 새 조회 시 첫 페이지로
        } catch (err) {
            console.error(err);
            setError("근태 내역 조회 실패");
        } finally {
            setLoading(false);
        }
    };

    /* ===============================
       서버 에러 메시지 뽑기
    =============================== */
    const getErrorMessage = (err, fallback) => {
        return err?.response?.data?.message || err?.response?.data?.error || fallback;
    };

    /* ===============================
       출근 처리
    =============================== */
    const handleCheckIn = () => {
        setLoading(true);
        setError(null);
        setResult(null);

        if (!navigator.geolocation) {
            setError("위치 정보를 지원하지 않는 브라우저입니다.");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const res = await axios.post("/back/work/check-in", {
                        latitude,
                        longitude,
                    });
                    setResult(res.data);
                    setHasCheckedIn(true);
                    await fetchTodayStatus(); // ✅ 상태 동기화
                } catch (err) {
                    setError(getErrorMessage(err, "출근 처리 중 오류가 발생했습니다."));
                } finally {
                    setLoading(false);
                }
            },
            () => {
                setError("위치 정보 접근이 거부되었습니다.");
                setLoading(false);
            }
        );
    };

    /* ===============================
       퇴근 처리
    =============================== */
    const handleCheckOut = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await axios.post("/back/work/check-out");
            setResult(res.data);
            setHasCheckedOut(true);
            await fetchTodayStatus(); // ✅ 상태 동기화
        } catch (err) {
            setError(getErrorMessage(err, "퇴근 처리 중 오류가 발생했습니다."));
        } finally {
            setLoading(false);
        }
    };

    /* ===============================
       오늘 상태 기반으로 버튼 잠금 여부 계산
    =============================== */
    const getTodayLockState = () => {
        if (!todayStatus) return { locked: false, reason: "" };

        const { workStatus, workType } = todayStatus;

        // 결근이면 출근/퇴근 불가
        if (workStatus === "ABSENT") {
            return { locked: true, reason: "결근 처리된 날짜입니다." };
        }

        // 휴가/외근이면 출근/퇴근 개념 없음
        if (workType === "LEAVE") {
            return { locked: true, reason: "오늘은 휴가 처리되어 출근/퇴근이 불가합니다." };
        }
        if (workType === "OUTSIDE") {
            return { locked: true, reason: "오늘은 외근 처리되어 출근/퇴근이 불가합니다." };
        }

        return { locked: false, reason: "" };
    };

    /* ===============================
       버튼 렌더링
    =============================== */
    const renderButton = () => {
        if (loading) {
            return (
                <Button disabled>
                    <Spinner size="sm" animation="border" className="me-2" />
                    처리 중...
                </Button>
            );
        }

        const { locked, reason } = getTodayLockState();

        if (locked) {
            return (
                <>
                    <Button variant="secondary" disabled>
                        출퇴근 불가
                    </Button>
                    {reason && <div className="mt-2 text-muted">{reason}</div>}
                </>
            );
        }

        // 아직 출근 전
        if (!hasCheckedIn) {
            return <Button onClick={handleCheckIn}>출근하기</Button>;
        }

        // 출근 후, 퇴근 전
        if (hasCheckedIn && !hasCheckedOut) {
            const isNight = todayStatus?.workType === "NIGHT";
            return (
                <Button variant="danger" onClick={handleCheckOut}>
                    {isNight ? "야근 종료(퇴근하기)" : "퇴근하기"}
                </Button>
            );
        }

        // 오늘 완료
        return (
            <Button variant="secondary" disabled>
                오늘 근무 완료
            </Button>
        );
    };

    return (
        <div className="attendance-page">
            <div className="at-header">
                <h2 className="at-title">출퇴근 기록</h2>
                <p className="at-subtitle">오늘 출근/퇴근을 처리하고, 기간별 내역을 확인합니다.</p>
            </div>

            {/* 출퇴근 카드 */}
            <Card className="at-card at-action-card">
                {renderButton()}

                {todayStatus && (
                    <div className="at-today mt-3">
                        <div>
                            📅 오늘 근무 상태:{" "}
                            <b
                                className={`at-badge at-status at-status-${String(
                                    todayStatus.workStatus || ""
                                ).toLowerCase()}`}
                            >
                                {todayStatus.workStatus ?? "-"}
                            </b>
                        </div>
                        <div className="mt-1">
                            🏷 근무 유형:{" "}
                            <b
                                className={`at-badge at-type at-type-${String(
                                    todayStatus.workType || ""
                                ).toLowerCase()}`}
                            >
                                {todayStatus.workType ?? "-"}
                            </b>
                        </div>
                    </div>
                )}

                {result && (
                    <Alert variant="success" className="mt-3">
                        {result.message || "처리가 완료되었습니다."}
                    </Alert>
                )}

                {error && (
                    <Alert variant="danger" className="mt-3">
                        {error}
                    </Alert>
                )}
            </Card>

            {/* 근태 조회 */}
            <Card className="at-card at-list-card">
                {/* ✅ 제목을 h2 톤으로 */}
                <div className="at-header at-list-header">
                    <h2 className="at-title">나의 근태 내역</h2>
                    <p className="at-subtitle">시작일 ~ 종료일로 기간을 지정해 조회할 수 있습니다.</p>
                </div>

                {/* ✅ 한 줄 배치: 시작일 ~ 종료일 [조회] */}
                <Form className="at-filter-row mb-3">
                    <div className="at-date-group">
                        <div className="at-date-item">
                            <div className="at-label">시작일</div>
                            <Form.Control
                                className="at-date-input"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>

                        <div className="at-tilde">~</div>

                        <div className="at-date-item">
                            <div className="at-label">종료일</div>
                            <Form.Control
                                className="at-date-input"
                                type="date"
                                value={endDate}
                                min={startDate || undefined}
                                max={todayStr}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <Button className="at-search-btn" onClick={fetchMyAttendance} disabled={loading}>
                        {loading ? (
                            <>
                                <Spinner size="sm" animation="border" className="me-2" />
                                조회 중...
                            </>
                        ) : (
                            "조회"
                        )}
                    </Button>
                </Form>

                <div className="at-table-wrap">
                    <Table bordered hover responsive className="at-table">
                        <thead>
                        <tr>
                            <th>근무일</th>
                            <th>출근 시간</th>
                            <th>퇴근 시간</th>
                            <th>근무상태</th>
                            <th>근무유형</th>
                            <th>총 근무시간(분)</th>
                        </tr>
                        </thead>

                        <tbody>
                        {records.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center at-empty">
                                    조회 결과 없음
                                </td>
                            </tr>
                        ) : (
                            pageRecords.map((r, idx) => (
                                <tr key={idx}>
                                    <td>{r.workDate}</td>
                                    <td>{r.checkIn || "-"}</td>
                                    <td>{r.checkOut || "-"}</td>

                                    <td>
                    <span
                        className={`at-badge at-status at-status-${String(
                            r.workStatus || ""
                        ).toLowerCase()}`}
                    >
                      {r.workStatus}
                    </span>
                                    </td>

                                    <td>
                    <span
                        className={`at-badge at-type at-type-${String(
                            r.workType || ""
                        ).toLowerCase()}`}
                    >
                      {r.workType}
                    </span>
                                    </td>

                                    <td>{r.totalWorkMinutes}</td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </Table>

                    {/* 페이지네이션 */}
                    {records.length > 0 && totalPages > 1 && (
                        <div className="at-pagination">
                            <button
                                className="at-page-btn"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                ‹
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .slice(
                                    Math.max(0, currentPage - 4),
                                    Math.min(totalPages, currentPage + 3)
                                )
                                .map((p) => (
                                    <button
                                        key={p}
                                        className={`at-page-btn ${p === currentPage ? "active" : ""}`}
                                        onClick={() => setCurrentPage(p)}
                                    >
                                        {p}
                                    </button>
                                ))}

                            <button
                                className="at-page-btn"
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                ›
                            </button>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );


};

export default Attendance;
