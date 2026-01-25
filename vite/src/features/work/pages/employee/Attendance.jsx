import React, { useEffect, useState } from "react";
import axios from "axios";
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
       내 근태 조회
    =============================== */
    const fetchMyAttendance = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get("/back/work/my", {
                params: { startDate, endDate },
            });
            setRecords(res.data);
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
        return (
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            fallback
        );
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

        // 휴가/외근이면 출근/퇴근 개념 없음(너가 WorkType에서 막았다고 했으니 프론트도 동일)
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
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <h2 className="mb-4">출퇴근 기록</h2>

            {/* 출퇴근 카드 */}
            <Card className="p-4 mb-4 shadow-sm">
                {renderButton()}

                {todayStatus && (
                    <div className="mt-3 text-muted">
                        <div>
                            📅 오늘 근무 상태: <b>{todayStatus.workStatus ?? "-"}</b>
                        </div>
                        <div>
                            🏷 근무 유형: <b>{todayStatus.workType ?? "-"}</b>
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
            <Card className="p-4 shadow-sm">
                <h5 className="mb-3">내 근태 내역</h5>

                <Form className="d-flex gap-2 mb-3">
                    <Form.Control
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <Form.Control
                        type="date"
                        value={endDate}
                        min={startDate || undefined}
                        max={todayStr}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                    <Button onClick={fetchMyAttendance} disabled={loading}>
                        조회
                    </Button>
                </Form>

                <Table bordered hover>
                    <thead>
                    <tr>
                        <th>근무일</th>
                        <th>출근</th>
                        <th>퇴근</th>
                        <th>근무상태</th>
                        <th>근무유형</th>
                        <th>총 근무시간(분)</th>
                    </tr>
                    </thead>
                    <tbody>
                    {records.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="text-center">
                                조회 결과 없음
                            </td>
                        </tr>
                    ) : (
                        records.map((r, idx) => (
                            <tr key={idx}>
                                <td>{r.workDate}</td>
                                <td>{r.checkIn || "-"}</td>
                                <td>{r.checkOut || "-"}</td>
                                <td>{r.workStatus}</td>
                                <td>{r.workType}</td>
                                <td>{r.totalWorkMinutes}</td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </Table>
            </Card>
        </div>
    );
};

export default Attendance;
