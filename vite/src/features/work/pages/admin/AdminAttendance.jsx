import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Table, Form, Button, Spinner, Alert, InputGroup } from "react-bootstrap";

const AdminAttendance = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // 필터
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [empName, setEmpName] = useState("");

    // 퇴근시간 수정 입력 상태(행별)
    // key: `${empId}_${workDate}` -> value: "YYYY-MM-DDTHH:mm"
    const [editCheckoutMap, setEditCheckoutMap] = useState({});
    const [savingKey, setSavingKey] = useState(null);

    const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

    const getErrorMessage = (err, fallback) => {
        return err?.response?.data?.message || err?.response?.data?.error || fallback;
    };

    /* ===============================
       근태 목록 조회 (이름 포함)
    =============================== */
    const fetchAttendance = async () => {
        setLoading(true);
        setError(null);
        setSuccessMsg(null);

        try {
            const res = await axios.get("/back/admin/attendance/list", {
                params: {
                    startDate,
                    endDate,
                    empName: empName?.trim() || undefined, // ✅ 이름 검색
                },
            });

            const data = res.data || [];
            setRecords(data);

            // 🔧 조회 결과가 바뀌면 edit map 초기화(현재 row 값 기준으로 세팅)
            const nextMap = {};
            data.forEach((r) => {
                const key = `${r.empId}_${r.workDate}`;
                // 서버 checkOut이 "2026-01-20T18:00:00" 같은 형태라고 가정
                if (r.checkOut) nextMap[key] = r.checkOut.slice(0, 16); // datetime-local 형태
            });
            setEditCheckoutMap(nextMap);
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

    useEffect(() => {
        if (startDate && endDate && endDate < startDate) {
            setEndDate(startDate); // ✅ 종료일을 시작일로 자동 보정
        }
    }, [startDate, endDate]);

    /* ===============================
       퇴근시간 수정
    =============================== */
    const updateCheckOut = async (empId, workDate) => {
        const key = `${empId}_${workDate}`;
        const checkOutValue = editCheckoutMap[key];

        if (!checkOutValue) {
            setError("수정할 퇴근 시간을 입력해주세요.");
            return;
        }

        setSavingKey(key);
        setError(null);
        setSuccessMsg(null);

        try {
            // ✅ 백엔드가 LocalDateTime.parse()를 쓰므로 초까지 있으면 안전하게 :00 붙여줌
            const checkOutIso = checkOutValue.length === 16 ? `${checkOutValue}:00` : checkOutValue;

            const res = await axios.patch("/back/admin/attendance/check-out", {
                empId,
                workDate,
                checkOut: checkOutIso,
            });

            // res.data는 AttendanceResponseDto(workStatus, workType) 형태
            setSuccessMsg(`퇴근 시간이 수정되었습니다. (상태: ${res.data?.workStatus ?? "-"}, 유형: ${res.data?.workType ?? "-"})`);

            await fetchAttendance(); // ✅ 목록 동기화
        } catch (e) {
            setError(getErrorMessage(e, "퇴근 시간 수정 실패"));
        } finally {
            setSavingKey(null);
        }
    };

    /* ===============================
       입력 핸들러
    =============================== */
    const handleCheckoutChange = (empId, workDate, value) => {
        const key = `${empId}_${workDate}`;
        setEditCheckoutMap((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <h2 className="mb-4">관리자 근태 조회</h2>

            {/* 🔍 필터 */}
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
            {successMsg && <Alert variant="success">{successMsg}</Alert>}

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
                        <th style={{ width: "240px" }}>퇴근시간 수정</th>
                    </tr>
                    </thead>
                    <tbody>
                    {records.map((r, idx) => {
                        const rowKey = `${r.empId}_${r.workDate}`;
                        const editingValue = editCheckoutMap[rowKey] || "";
                        const isSaving = savingKey === rowKey;

                        const isLeaveOrOutside = r.workType === "LEAVE" || r.workType === "OUTSIDE";

                        return (
                            <tr key={idx}>
                                <td>{r.empId}</td>
                                <td>{r.empName}</td>
                                <td>{r.workDate}</td>
                                <td>{r.checkIn ?? "-"}</td>
                                <td>{r.checkOut ?? "-"}</td>
                                <td>{r.workStatus}</td>
                                <td>{r.workType}</td>
                                <td>{r.totalWorkMinutes}</td>

                                <td>
                                    {isLeaveOrOutside ? (
                                        <span className="text-muted">휴가/외근은 수정 불가</span>
                                    ) : (
                                        <div className="d-flex gap-2">
                                            <Form.Control
                                                type="datetime-local"
                                                value={editingValue}
                                                onChange={(e) =>
                                                    handleCheckoutChange(r.empId, r.workDate, e.target.value)
                                                }
                                            />
                                            <Button
                                                variant="primary"
                                                disabled={isSaving || !editingValue}
                                                onClick={() => updateCheckOut(r.empId, r.workDate)}
                                            >
                                                {isSaving ? "저장..." : "저장"}
                                            </Button>
                                        </div>
                                    )}

                                    {/* 🔥 위험 케이스 힌트: 퇴근이 없고 NIGHT면 특히 리스크 */}
                                    {!isLeaveOrOutside && !r.checkOut && r.workType === "NIGHT" && (
                                        <div className="mt-1 text-danger" style={{ fontSize: "0.85rem" }}>
                                            ⚠ 퇴근 미기록(NIGHT) — 수정 권장
                                        </div>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
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
