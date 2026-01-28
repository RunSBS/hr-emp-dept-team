import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    Table,
    Form,
    Button,
    Spinner,
    Alert,
    InputGroup,
    Card,
    Row,
    Col,
    Badge,
} from "react-bootstrap";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Title,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Title
);

const AdminAttendance = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);

    const [error, setError] = useState(null);
    const [aiError, setAiError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // 필터
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [empName, setEmpName] = useState("");

    // 퇴근시간 수정 입력 상태
    const [editCheckoutMap, setEditCheckoutMap] = useState({});
    const [savingKey, setSavingKey] = useState(null);

    // ===== AI 영역 state =====
    const [alerts, setAlerts] = useState([]); // [{empId, empName, score, reason}]
    const [selectedEmpId, setSelectedEmpId] = useState("");
    const [report, setReport] = useState(null); // employee-report 결과

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
                    empName: empName?.trim() || undefined,
                },
            });

            const data = res.data || [];
            setRecords(data);

            // edit map 초기화
            const nextMap = {};
            data.forEach((r) => {
                const key = `${r.empId}_${r.workDate}`;
                if (r.checkOut) nextMap[key] = r.checkOut.slice(0, 16);
            });
            setEditCheckoutMap(nextMap);

            // 조회 결과 중 첫 empId를 기본 선택(선택값이 없을 때만)
            if (!selectedEmpId && data.length > 0) {
                setSelectedEmpId(data[0].empId);
            }
        } catch (e) {
            setError(getErrorMessage(e, "근태 조회 실패"));
        } finally {
            setLoading(false);
        }
    };

    /* ===============================
       AI: 이상 감지 목록
    =============================== */
    const fetchAnomalies = async () => {
        setAiLoading(true);
        setAiError(null);
        try {
            // ✅ Vite proxy: /ai -> http://localhost:5000 (rewrite로 /ai 제거)
            const res = await axios.get("/ai/eun/attendance/anomalies", {
                params: {
                    startDate: startDate || undefined,
                    endDate: endDate || undefined,
                },
                withCredentials: true,
            });
            setAlerts(res.data?.alerts || []);
        } catch (e) {
            setAiError(getErrorMessage(e, "AI 이상 감지 조회 실패(500이면 Flask 콘솔 확인)"));
        } finally {
            setAiLoading(false);
        }
    };

    /* ===============================
       AI: 사원 리포트
    =============================== */
    const fetchEmployeeReport = async (empId) => {
        if (!empId) return;
        setAiLoading(true);
        setAiError(null);
        setReport(null);

        try {
            const res = await axios.get("/ai/eun/attendance/employee-report", {
                params: {
                    empId,
                    startDate: startDate || undefined,
                    endDate: endDate || undefined,
                },
                withCredentials: true,
            });
            setReport(res.data);
        } catch (e) {
            setAiError(getErrorMessage(e, "AI 사원 리포트 조회 실패"));
        } finally {
            setAiLoading(false);
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

    // 조회 버튼 눌렀을 때 AI도 같이 갱신하고 싶으면: fetchAttendance 호출 후 fetchAnomalies 호출
    const handleSearch = async () => {
        await fetchAttendance();
        await fetchAnomalies();
        if (selectedEmpId) {
            await fetchEmployeeReport(selectedEmpId);
        }
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
            const checkOutIso = checkOutValue.length === 16 ? `${checkOutValue}:00` : checkOutValue;

            const res = await axios.patch("/back/admin/attendance/check-out", {
                empId,
                workDate,
                checkOut: checkOutIso,
            });

            setSuccessMsg(
                `퇴근 시간이 수정되었습니다. (상태: ${res.data?.workStatus ?? "-"}, 유형: ${res.data?.workType ?? "-"})`
            );

            await fetchAttendance();
            await fetchAnomalies();
            if (selectedEmpId) await fetchEmployeeReport(selectedEmpId);
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

    // ===== 차트 데이터 생성 =====
    const statusCounts = report?.statusCounts || {};
    const statusLabels = Object.keys(statusCounts);
    const statusValues = Object.values(statusCounts);

    const barData = {
        labels: statusLabels,
        datasets: [
            {
                label: "건수",
                data: statusValues,
            },
        ],
    };

    const lineData = {
        labels: report?.series?.labels || [],
        datasets: [
            {
                label: "NORMAL(분)",
                data: report?.series?.normal || [],
            },
            {
                label: "OVERTIME(분)",
                data: report?.series?.overtime || [],
            },
            {
                label: "UNPAID(분)",
                data: report?.series?.unpaid || [],
            },
        ],
    };

    // ===== 상단 “이상 감지 멘트” =====
    const alertNames = alerts?.slice(0, 3).map((a) => a.empName).filter(Boolean);
    const alertMent = alertNames?.length
        ? `${alertNames.join(", ")} 사원의 근태 이상이 감지되었습니다. 확인 후 대처 부탁드립니다.`
        : "현재 감지된 근태 이상 알림이 없습니다.";

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <h2 className="mb-4">관리자 근태 조회</h2>

            {/* ================= AI 패널 ================= */}
            <Card className="p-3 mb-4 shadow-sm">
                <div className="d-flex align-items-center justify-content-between mb-2">
                    <div>
                        <strong>AI 근태 이상 감지</strong>{" "}
                        {aiLoading && <Spinner animation="border" size="sm" className="ms-2" />}
                    </div>

                    <div className="d-flex gap-2">
                        <Button variant="outline-primary" onClick={fetchAnomalies} disabled={aiLoading}>
                            이상 감지 새로고침
                        </Button>
                        <Button
                            variant="outline-secondary"
                            onClick={() => fetchEmployeeReport(selectedEmpId)}
                            disabled={aiLoading || !selectedEmpId}
                        >
                            선택 사원 분석
                        </Button>
                    </div>
                </div>

                <div className="mb-3">
                    <Badge bg={alerts.length ? "danger" : "success"} className="me-2">
                        {alerts.length ? `ALERT ${alerts.length}` : "OK"}
                    </Badge>
                    <span>{alertMent}</span>
                </div>

                {aiError && <Alert variant="danger">{aiError}</Alert>}

                <Row className="g-3">
                    {/* 왼쪽: 그래프 */}
                    <Col md={7}>
                        <Card className="p-3 h-100">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <div><strong>근태 그래프</strong></div>

                                {/* ✅ 사원 선택: empId 기준 */}
                                <Form.Select
                                    style={{ maxWidth: 260 }}
                                    value={selectedEmpId}
                                    onChange={(e) => {
                                        const id = e.target.value;
                                        setSelectedEmpId(id);
                                        fetchEmployeeReport(id);
                                    }}
                                >
                                    <option value="">사원 선택</option>
                                    {/* records에서 unique empId로 옵션 구성 */}
                                    {Array.from(new Map(records.map(r => [r.empId, r])).values()).map((r) => (
                                        <option key={r.empId} value={r.empId}>
                                            {r.empName} ({r.empId})
                                        </option>
                                    ))}
                                </Form.Select>
                            </div>

                            {!report && <div className="text-muted">사원을 선택하면 그래프가 표시됩니다.</div>}

                            {report && (
                                <>
                                    <div className="mb-3">
                                        <Bar
                                            data={barData}
                                            options={{
                                                responsive: true,
                                                plugins: { title: { display: true, text: "상태 분포" } },
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <Line
                                            data={lineData}
                                            options={{
                                                responsive: true,
                                                plugins: { title: { display: true, text: "일자별 근무 분(분)" } },
                                            }}
                                        />
                                    </div>
                                </>
                            )}
                        </Card>
                    </Col>

                    {/* 오른쪽: 분석 텍스트 */}
                    <Col md={5}>
                        <Card className="p-3 h-100">
                            <strong className="mb-2">분석 내용</strong>

                            {!report && <div className="text-muted">사원을 선택하면 분석이 표시됩니다.</div>}

                            {report?.analysis && (
                                <>
                                    <div className="mb-2">
                                        <b>요약</b>
                                        <div>{report.analysis.summary}</div>
                                    </div>

                                    <div className="mb-2">
                                        <b>핵심 관찰</b>
                                        <ul className="mb-0">
                                            {report.analysis.bullets?.map((b, idx) => (
                                                <li key={idx}>{b}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <b>권장 조치</b>
                                        <ul className="mb-0">
                                            {report.analysis.recommendedActions?.map((a, idx) => (
                                                <li key={idx}>{a}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </>
                            )}

                            {/* 알림 Top 리스트(사유 포함) */}
                            {alerts?.length > 0 && (
                                <div className="mt-3">
                                    <b>이상 감지 Top</b>
                                    <ul className="mb-0">
                                        {alerts.slice(0, 5).map((a) => (
                                            <li key={`${a.empId}_${a.score}`}>
                                                {a.empName} ({a.empId}) - {a.reason}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </Card>
                    </Col>
                </Row>
            </Card>

            {/* ================= 기존 조회/수정 UI ================= */}
            <Form className="d-flex flex-wrap gap-3 mb-3">
                <Form.Group>
                    <Form.Label>시작일</Form.Label>
                    <Form.Control type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
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
                                                onChange={(e) => handleCheckoutChange(r.empId, r.workDate, e.target.value)}
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

            {!loading && records.length === 0 && <Alert variant="secondary">조회된 근태 기록이 없습니다.</Alert>}
        </div>
    );
};

export default AdminAttendance;
