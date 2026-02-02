import React, { useEffect, useMemo, useState } from "react";
import "../../styles/AdminAttendance.css";
import axios from "axios";
import {
    Table,
    Form,
    Button,
    Spinner,
    Alert,
    InputGroup,
} from "react-bootstrap";

const AdminAttendance = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // 필터
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [empName, setEmpName] = useState("");

    // 퇴근시간 수정 입력 상태
    const [editCheckoutMap, setEditCheckoutMap] = useState({});
    const [savingKey, setSavingKey] = useState(null);

    const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

    const getErrorMessage = (err, fallback) => {
        return err?.response?.data?.message || err?.response?.data?.error || fallback;
    };

    // ✅ 페이지네이션
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const totalPages = useMemo(() => {
        return Math.max(1, Math.ceil(records.length / pageSize));
    }, [records.length]);

    const pagedRecords = useMemo(() => {
        const startIdx = (currentPage - 1) * pageSize;
        return records.slice(startIdx, startIdx + pageSize);
    }, [records, currentPage]);

    // ✅ 페이지 버튼(최대 7개만 노출)
    const pageNumbers = useMemo(() => {
        const maxButtons = 7;
        const half = Math.floor(maxButtons / 2);

        let start = Math.max(1, currentPage - half);
        let end = Math.min(totalPages, start + maxButtons - 1);

        // end가 먼저 닿으면 start를 당김
        start = Math.max(1, end - maxButtons + 1);

        const arr = [];
        for (let p = start; p <= end; p++) arr.push(p);
        return arr;
    }, [currentPage, totalPages]);

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
                    empName: empName?.trim() || undefined,
                },
            });

            const data = res.data || [];
            setRecords(data);

            // ✅ 조회 결과가 바뀌면 페이지 1로
            setCurrentPage(1);

            // edit map 초기화
            const nextMap = {};
            data.forEach((r) => {
                const key = `${r.empId}_${r.workDate}`;
                if (r.checkOut) nextMap[key] = r.checkOut.slice(0, 16);
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

    // 날짜 보정
    useEffect(() => {
        if (startDate && endDate && endDate < startDate) {
            setEndDate(startDate);
        }
    }, [startDate, endDate]);

    const handleSearch = async () => {
        await fetchAttendance();
    };

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
            const checkOutIso =
                checkOutValue.length === 16 ? `${checkOutValue}:00` : checkOutValue;

            const res = await axios.patch("/back/admin/attendance/check-out", {
                empId,
                workDate,
                checkOut: checkOutIso,
            });

            setSuccessMsg(
                `퇴근 시간이 수정되었습니다. (상태: ${res.data?.workStatus ?? "-"}, 유형: ${
                    res.data?.workType ?? "-"
                })`
            );

            await fetchAttendance();
        } catch (e) {
            setError(getErrorMessage(e, "퇴근 시간 수정 실패"));
        } finally {
            setSavingKey(null);
        }
    };

    const handleCheckoutChange = (empId, workDate, value) => {
        const key = `${empId}_${workDate}`;
        setEditCheckoutMap((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="admin-attendance">
            {/* ===== Header ===== */}
            <div className="aa-header">
                <h2 className="aa-title">관리자 근태 조회</h2>
                <p className="aa-subtitle">
                    기간/이름으로 조회하고, 퇴근시간을 수정할 수 있습니다.
                </p>
            </div>

            {/* ===== Filter ===== */}
            <div className="aa-card aa-filter">
                <Form className="aa-filter-form d-flex flex-wrap gap-3">
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
                                        handleSearch();
                                    }
                                }}
                            />
                            <Button variant="outline-secondary" onClick={() => setEmpName("")}>
                                초기화
                            </Button>
                        </InputGroup>
                    </Form.Group>

                    <div className="d-flex align-items-end">
                        <Button onClick={handleSearch} disabled={loading}>
                            {loading ? "조회 중..." : "조회"}
                        </Button>
                    </div>
                </Form>
            </div>

            {/* ===== Loading / Alerts ===== */}
            {loading && (
                <div className="aa-loading">
                    <Spinner animation="border" size="sm" className="me-2" />
                    불러오는 중...
                </div>
            )}

            {error && (
                <Alert className="aa-alert" variant="danger">
                    {error}
                </Alert>
            )}
            {successMsg && (
                <Alert className="aa-alert" variant="success">
                    {successMsg}
                </Alert>
            )}

            {/* ===== Table ===== */}
            {!loading && records.length > 0 && (
                <div className="aa-card aa-table-wrap">
                    <Table bordered hover responsive className="aa-table">
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
                        {pagedRecords.map((r) => {
                            const rowKey = `${r.empId}_${r.workDate}`;
                            const editingValue = editCheckoutMap[rowKey] || "";
                            const isSaving = savingKey === rowKey;

                            const isLeaveOrOutside =
                                r.workType === "LEAVE" || r.workType === "OUTSIDE";

                            const isNightNoCheckout =
                                !isLeaveOrOutside && !r.checkOut && r.workType === "NIGHT";

                            return (
                                <tr key={rowKey} className={isNightNoCheckout ? "aa-row-risk" : ""}>
                                    <td>{r.empId}</td>
                                    <td>{r.empName}</td>
                                    <td>{r.workDate}</td>
                                    <td>{r.checkIn ?? "-"}</td>
                                    <td>{r.checkOut ?? "-"}</td>

                                    {/* ✅ 상태 배지 */}
                                    <td>
                      <span
                          className={`aa-badge aa-status aa-status-${String(
                              r.workStatus || ""
                          ).toLowerCase()}`}
                      >
                        {r.workStatus}
                      </span>
                                    </td>

                                    {/* ✅ 유형 배지 */}
                                    <td>
                      <span
                          className={`aa-badge aa-type aa-type-${String(
                              r.workType || ""
                          ).toLowerCase()}`}
                      >
                        {r.workType}
                      </span>
                                    </td>

                                    <td>{r.totalWorkMinutes}</td>

                                    <td>
                                        {isLeaveOrOutside ? (
                                            <span className="aa-muted">휴가/외근은 수정 불가</span>
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

                                        {/* ✅ NIGHT 미퇴근 경고 문구 */}
                                        {isNightNoCheckout && (
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

                    {/* ===== Pagination ===== */}
                    {totalPages > 1 && (
                        <div className="aa-pagination d-flex justify-content-center align-items-center gap-2 mt-3">
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            >
                                이전
                            </Button>

                            {pageNumbers.map((p) => (
                                <Button
                                    key={p}
                                    size="sm"
                                    variant={p === currentPage ? "primary" : "outline-primary"}
                                    onClick={() => setCurrentPage(p)}
                                >
                                    {p}
                                </Button>
                            ))}

                            <Button
                                variant="outline-secondary"
                                size="sm"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            >
                                다음
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {!loading && records.length === 0 && (
                <Alert className="aa-alert" variant="secondary">
                    조회된 근태 기록이 없습니다.
                </Alert>
            )}
        </div>
    );
};

export default AdminAttendance;
