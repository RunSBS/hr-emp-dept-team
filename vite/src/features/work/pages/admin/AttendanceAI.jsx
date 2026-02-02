// AttendanceAI.jsx
import React, { useEffect, useMemo, useState } from "react";
import "../../styles/AttendanceAI.css";
import axios from "axios";
import {
    Form,
    Button,
    Spinner,
    Alert,
    InputGroup,
    Row,
    Col,
    Badge,
} from "react-bootstrap";

// import {
//     Chart as ChartJS,
//     CategoryScale,
//     LinearScale,
//     BarElement,
//     PointElement,
//     LineElement,
//     Tooltip,
//     Legend,
//     Title,
// } from "chart.js";
// import { Bar, Line } from "react-chartjs-2";

// ChartJS.register(
//     CategoryScale,
//     LinearScale,
//     BarElement,
//     PointElement,
//     LineElement,
//     Tooltip,
//     Legend,
//     Title
// );

const AttendanceAI = () => {
    const [records, setRecords] = useState([]);

    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);

    const [error, setError] = useState(null);
    const [aiError, setAiError] = useState(null);

    // 필터
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [empName, setEmpName] = useState("");

    // AI 영역 state
    const [alerts, setAlerts] = useState([]);
    const [selectedEmpId, setSelectedEmpId] = useState("");
    const [report, setReport] = useState(null);

    const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

    const getErrorMessage = (err, fallback) =>
        err?.response?.data?.message || err?.response?.data?.error || fallback;

    const toHHmm = (minutes) => {
        if (minutes === null || minutes === undefined || Number.isNaN(Number(minutes))) return "-";

        const m = Math.max(0, Number(minutes)); // 음수 방지
        const mmOfDay = m % (24 * 60); // 24시간 기준으로만 표시

        const hh = String(Math.floor(mmOfDay / 60)).padStart(2, "0");
        const mm = String(Math.floor(mmOfDay % 60)).padStart(2, "0");

        return `${hh}:${mm}`;
    };


    /* ===============================
       근태 목록 조회 (사원 드롭다운 만들기용)
    =============================== */
    const fetchAttendanceForEmployees = async () => {
        setLoading(true);
        setError(null);

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

            if (!selectedEmpId && data.length > 0) {
                setSelectedEmpId(data[0].empId);
            }
        } catch (e) {
            setError(getErrorMessage(e, "근태 조회 실패(사원 목록 구성 실패)"));
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
            const res = await axios.get("/ai/attendance/anomalies", {
                params: {
                    startDate: startDate || undefined,
                    endDate: endDate || undefined,
                },
                withCredentials: true,
            });
            setAlerts(res.data?.alerts || []);
        } catch (e) {
            setAiError(getErrorMessage(e, "AI 이상 감지 조회 실패(Flask 콘솔 확인)"));
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
            const res = await axios.get("/ai/attendance/employee-report", {
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
        const init = async () => {
            await fetchAttendanceForEmployees();
            await fetchAnomalies();
        };
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (startDate && endDate && endDate < startDate) setEndDate(startDate);
    }, [startDate, endDate]);

    useEffect(() => {
        if (selectedEmpId && !report) fetchEmployeeReport(selectedEmpId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedEmpId]);

    const handleSearch = async () => {
        await fetchAttendanceForEmployees();
        await fetchAnomalies();
        if (selectedEmpId) await fetchEmployeeReport(selectedEmpId);
    };

    // ===== 차트 데이터 =====
    const statusCounts = report?.statusCounts || {};
    const statusLabels = Object.keys(statusCounts);
    const statusValues = Object.values(statusCounts);

    const barData = {
        labels: statusLabels,
        datasets: [{ label: "건수", data: statusValues }],
    };

    // ✅ 출근/퇴근 “시각” 라인 차트
    const timeLabels = report?.seriesTimes?.labels || [];
    const checkInMinutes = report?.seriesTimes?.checkInMinutes || [];
    const checkOutMinutes = report?.seriesTimes?.checkOutMinutes || [];

    const timeLineData = {
        labels: timeLabels,
        datasets: [
            {
                label: "출근 시각",
                data: checkInMinutes,
                spanGaps: true,
            },
            {
                label: "퇴근 시각",
                data: checkOutMinutes,
                spanGaps: true,
            },
        ],
    };

    const timeLineOptions = {
        responsive: true,
        plugins: {
            title: { display: true, text: "일자별 출퇴근 시각(HH:mm)" },
            tooltip: {
                callbacks: { label: (ctx) => `${ctx.dataset.label}: ${toHHmm(ctx.raw)}` },
            },
        },
        scales: {
            y: {
                min: 0,
                max: 24 * 60,
                ticks: {
                    stepSize: 60,
                    callback: (value) => toHHmm(value),
                },
            },
        },
    };


    // ===== 상단 멘트 =====
    const alertNames = alerts?.slice(0, 3).map((a) => a.empName).filter(Boolean);
    const alertMent = alertNames?.length
        ? `${alertNames.join(", ")} 사원의 근태 이상이 감지되었습니다. 확인 후 대처 부탁드립니다.`
        : "현재 감지된 근태 이상 알림이 없습니다.";

    const employeeOptions = Array.from(new Map(records.map((r) => [r.empId, r])).values());

    return (
        <div className="att-ai">
            {/* ===== Header ===== */}
            <div className="att-ai__header">
                <div>
                    <h2 className="att-ai__title">근태 이상 감지 AI</h2>
                    <p className="att-ai__subtitle">
                        기간/이름으로 사원을 필터링하고, 이상 징후와 분석 리포트를 확인합니다.
                    </p>
                </div>

                <div className="att-ai__header-actions">
                    <Button
                        className="att-ai__btn"
                        variant="outline-primary"
                        onClick={fetchAnomalies}
                        disabled={aiLoading}
                    >
                        이상 감지 새로고침
                    </Button>
                    <Button
                        className="att-ai__btn"
                        variant="outline-secondary"
                        onClick={() => fetchEmployeeReport(selectedEmpId)}
                        disabled={aiLoading || !selectedEmpId}
                    >
                        선택 사원 분석
                    </Button>
                </div>
            </div>

            {/* ===== Filter Card ===== */}
            <div className="att-ai__card att-ai__filter">
                <Form className="att-ai__filter-form d-flex flex-wrap gap-3">
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

                    <Form.Group style={{ minWidth: "280px" }}>
                        <Form.Label>이름 검색(사원 목록 필터)</Form.Label>
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
                        <Button onClick={handleSearch} disabled={loading || aiLoading}>
                            {(loading || aiLoading) ? "조회 중..." : "조회"}
                        </Button>
                    </div>
                </Form>

                {(loading || aiLoading) && (
                    <div className="att-ai__loading">
                        <Spinner animation="border" size="sm" className="me-2" />
                        불러오는 중...
                    </div>
                )}

                {error && <Alert className="att-ai__alert" variant="danger">{error}</Alert>}
            </div>

            {/* ===== AI Panel ===== */}
            <div className="att-ai__card att-ai__panel">
                <div className={`att-ai__banner ${alerts.length ? "is-danger" : "is-ok"}`}>
                    <div className="att-ai__banner-left">
                        <Badge bg={alerts.length ? "danger" : "success"} className="me-2">
                            {alerts.length ? `ALERT ${alerts.length}` : "OK"}
                        </Badge>
                        <span className="att-ai__banner-text">{alertMent}</span>
                    </div>

                    <div className="att-ai__banner-right">
                        {(aiLoading || loading) && <Spinner animation="border" size="sm" />}
                    </div>
                </div>

                {aiError && <Alert className="att-ai__alert" variant="danger">{aiError}</Alert>}

                <Row className="g-3">
                    {/* Left: Charts */}
                    <Col md={7}>
                        <div className="att-ai__subcard h-100">
                            <div className="att-ai__subhead">
                                <strong>근태 그래프</strong>

                                <Form.Select
                                    className="att-ai__select"
                                    value={selectedEmpId}
                                    onChange={(e) => {
                                        const id = e.target.value;
                                        setSelectedEmpId(id);
                                        fetchEmployeeReport(id);
                                    }}
                                    disabled={loading}
                                >
                                    <option value="">사원 선택</option>
                                    {employeeOptions.map((r) => (
                                        <option key={r.empId} value={r.empId}>
                                            {r.empName} ({r.empId})
                                        </option>
                                    ))}
                                </Form.Select>
                            </div>

                            {!report && (
                                <div className="att-ai__empty">사원을 선택하면 그래프가 표시됩니다.</div>
                            )}

                            {report && (
                                <>
                                    <div className="att-ai__chart-block">
                                        <Bar
                                            data={barData}
                                            options={{
                                                responsive: true,
                                                plugins: {
                                                    title: { display: true, text: "상태 분포" },
                                                    legend: { display: false },
                                                },
                                            }}
                                        />
                                    </div>

                                    <div className="att-ai__chart-block">
                                        <Line data={timeLineData} options={timeLineOptions} />
                                    </div>
                                </>
                            )}
                        </div>
                    </Col>

                    {/* Right: Analysis */}
                    <Col md={5}>
                        <div className="att-ai__subcard h-100">
                            <div className="att-ai__subhead">
                                <strong>분석 내용</strong>
                            </div>

                            {!report && (
                                <div className="att-ai__empty">사원을 선택하면 분석이 표시됩니다.</div>
                            )}

                            {report?.analysis && (
                                <div className="att-ai__analysis">
                                    <div className="att-ai__section">
                                        <div className="att-ai__label">요약</div>
                                        <div className="att-ai__text">{report.analysis.summary}</div>
                                    </div>

                                    <div className="att-ai__section">
                                        <div className="att-ai__label">핵심 관찰</div>
                                        <ul className="att-ai__list">
                                            {report.analysis.bullets?.map((b, idx) => (
                                                <li key={idx}>{b}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="att-ai__section">
                                        <div className="att-ai__label">권장 조치</div>
                                        <ul className="att-ai__list">
                                            {report.analysis.recommendedActions?.map((a, idx) => (
                                                <li key={idx}>{a}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {alerts?.length > 0 && (
                                <div className="att-ai__top">
                                    <div className="att-ai__label">이상 감지 Top</div>
                                    <ul className="att-ai__list">
                                        {alerts.slice(0, 5).map((a) => (
                                            <li key={`${a.empId}_${a.score}`}>
                                                <b>{a.empName}</b> ({a.empId}) — {a.reason}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default AttendanceAI;
