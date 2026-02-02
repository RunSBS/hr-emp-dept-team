import React, { useMemo, useState } from "react";
import "../../styles/AdminSalary.css"
import axios from "axios";
import { Card, Form, Button, Alert, Spinner, Table } from "react-bootstrap";

const AdminSalary = () => {
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);
    const [error, setError] = useState(null);

    const [empId, setEmpId] = useState("");
    const [payMonth, setPayMonth] = useState(""); // YYYY-MM
    const [annualSalary, setAnnualSalary] = useState("");
    const [baseSalary, setBaseSalary] = useState("");

    const [summary, setSummary] = useState(null);
    const [monthlyList, setMonthlyList] = useState([]);

    const fetchMonthlyList = async () => {
        setLoading(true);
        setError(null);
        setMsg(null);
        try {
            const res = await axios.get("/back/admin/payroll/monthly-list", {
                params: { payMonth: payMonthAsDate },
            });
            setMonthlyList(res.data || []);
            setMsg("월 전체 급여 리스트 조회 완료");
        } catch (e) {
            setError(e?.response?.data?.message || "월 리스트 조회 실패");
        } finally {
            setLoading(false);
        }
    };

    const payMonthAsDate = useMemo(() => {
        if (!payMonth) return "";
        return `${payMonth}-01`;
    }, [payMonth]);

    const fetchSummary = async () => {
        if (!empId || !payMonthAsDate) return;
        const res = await axios.get("/back/admin/payroll/summary", {
            params: { empId, payMonth: payMonthAsDate },
        });
        setSummary(res.data);
    };

    const handleUpsert = async () => {
        setLoading(true);
        setMsg(null);
        setError(null);
        try {
            await axios.post("/back/admin/payroll/salary", {
                empId,
                payMonth: payMonthAsDate,
                annualSalary: annualSalary ? Number(annualSalary) : null,
                baseSalary: baseSalary ? Number(baseSalary) : null,
            });
            setMsg("급여 정보 저장 완료");
            await fetchSummary();
        } catch (e) {
            setError(e?.response?.data?.message || "저장 실패");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = async () => {
        setLoading(true);
        setMsg(null);
        setError(null);
        try {
            await axios.post("/back/admin/payroll/close", null, {
                params: { payMonth: payMonthAsDate },
            });
            setMsg("월 급여 마감 완료");
            await fetchSummary();
        } catch (e) {
            setError(e?.response?.data?.message || "마감 실패");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-salary">
            {/* ===== Header ===== */}
            <div className="as-header">
                <h2 className="as-title">급여 관리</h2>
                <p className="as-subtitle">
                    사원별 급여 입력/조회, 월 마감, 월 전체 리스트 조회를 진행합니다.
                </p>
            </div>

            {/* ===== Form Card ===== */}
            <div className="as-card as-form-card">
                {/* 메시지 영역 */}
                {msg && (
                    <Alert className="as-alert" variant="success">
                        {msg}
                    </Alert>
                )}
                {error && (
                    <Alert className="as-alert" variant="danger">
                        {error}
                    </Alert>
                )}

                <Form className="as-form">
                    <div className="as-form-grid">
                        <Form.Group className="as-field">
                            <Form.Label>사번(empId)</Form.Label>
                            <Form.Control
                                value={empId}
                                onChange={(e) => setEmpId(e.target.value)}
                                placeholder="예) 1001"
                            />
                        </Form.Group>

                        <Form.Group className="as-field">
                            <Form.Label>급여 월(payMonth)</Form.Label>
                            <Form.Control
                                type="month"
                                value={payMonth}
                                onChange={(e) => setPayMonth(e.target.value)}
                            />
                            <div className="as-hint">
                                전송값: <b>{payMonthAsDate || "YYYY-MM-01"}</b>
                            </div>
                        </Form.Group>

                        <Form.Group className="as-field">
                            <Form.Label>연봉(annualSalary)</Form.Label>
                            <Form.Control
                                type="number"
                                value={annualSalary}
                                onChange={(e) => setAnnualSalary(e.target.value)}
                                placeholder="예) 48000000"
                            />
                        </Form.Group>

                        <Form.Group className="as-field">
                            <Form.Label>월 기본급(baseSalary)</Form.Label>
                            <Form.Control
                                type="number"
                                value={baseSalary}
                                onChange={(e) => setBaseSalary(e.target.value)}
                                placeholder="예) 3000000"
                            />
                        </Form.Group>
                    </div>

                    {/* 버튼 영역 */}
                    <div className="as-actions">
                        <Button className="as-btn" onClick={handleUpsert} disabled={loading}>
                            {loading ? <Spinner size="sm" animation="border" /> : "급여 정보 저장"}
                        </Button>

                        <Button
                            className="as-btn"
                            variant="danger"
                            onClick={handleClose}
                            disabled={loading || !payMonthAsDate}
                            title={!payMonthAsDate ? "급여 월을 먼저 선택해주세요." : ""}
                        >
                            {loading ? <Spinner size="sm" animation="border" /> : "월 급여 마감"}
                        </Button>

                        <Button
                            className="as-btn"
                            variant="secondary"
                            onClick={fetchSummary}
                            disabled={loading || !empId || !payMonthAsDate}
                            title={!empId || !payMonthAsDate ? "사번/급여 월을 입력해주세요." : ""}
                        >
                            조회
                        </Button>

                        <Button
                            className="as-btn"
                            variant="outline-primary"
                            onClick={fetchMonthlyList}
                            disabled={loading || !payMonthAsDate}
                            title={!payMonthAsDate ? "급여 월을 먼저 선택해주세요." : ""}
                        >
                            월 전체 리스트 조회
                        </Button>
                    </div>
                    <div className="as-action-guide">
                        ※ <b>조회</b> 기능은 <b>사번</b>과 <b>급여 월</b>을 모두 입력해야 활성화됩니다.
                    </div>
                </Form>
            </div>

            {/* ===== Monthly List ===== */}
            {monthlyList.length > 0 && (
                <div className="as-card as-table-card">
                    <div className="as-section-head">
                        <h5 className="as-section-title">월 전체 사원 급여 리스트</h5>
                        <div className="as-section-meta">
                            기준 월: <b>{payMonthAsDate}</b>
                        </div>
                    </div>

                    <div className="as-table-wrap">
                        <Table bordered hover responsive className="as-table">
                            <thead>
                            <tr>
                                <th>사번</th>
                                <th>급여월</th>
                                <th>월기본급</th>
                                <th>정상분</th>
                                <th>무급분</th>
                                <th>월급여</th>
                                <th>야근분</th>
                                <th>야근수당</th>
                                <th>총지급</th>
                            </tr>
                            </thead>
                            <tbody>
                            {monthlyList.map((r, idx) => (
                                <tr key={idx}>
                                    <td>{r.empId}</td>
                                    <td>{r.payMonth}</td>
                                    <td>{r.baseSalary}</td>
                                    <td>{r.totalNormalMinutes}</td>
                                    <td>{r.totalUnpaidMinutes}</td>
                                    <td>{r.totalSalary}</td>
                                    <td>{r.totalOvertimeMinutes}</td>
                                    <td>{r.totalOvAmount}</td>
                                    <td className="as-strong">{r.grandTotal}</td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    </div>
                </div>
            )}

            {/* ===== Summary ===== */}
            {summary && (
                <div className="as-card as-summary-card">
                    <div className="as-section-head">
                        <h5 className="as-section-title">급여 요약</h5>
                        <div className="as-section-meta">
                            사번: <b>{summary.empId}</b> / 월: <b>{summary.payMonth}</b>
                        </div>
                    </div>

                    <div className="as-table-wrap">
                        <Table bordered className="as-table as-summary-table">
                            <tbody>
                            <tr>
                                <th>사번</th>
                                <td>{summary.empId}</td>
                                <th>급여 월</th>
                                <td>{summary.payMonth}</td>
                            </tr>
                            <tr>
                                <th>월 기본급</th>
                                <td>{summary.baseSalary}</td>
                                <th>연봉</th>
                                <td>{summary.annualSalary}</td>
                            </tr>
                            <tr>
                                <th>정상 근무 분</th>
                                <td>{summary.totalNormalMinutes}</td>
                                <th>무급 공제 분</th>
                                <td>{summary.totalUnpaidMinutes}</td>
                            </tr>
                            <tr>
                                <th>월 급여</th>
                                <td>{summary.totalSalary}</td>
                                <th>야근 분</th>
                                <td>{summary.totalOvertimeMinutes}</td>
                            </tr>
                            <tr>
                                <th>야근 수당</th>
                                <td>{summary.totalOvAmount}</td>
                                <th>총 지급</th>
                                <td className="as-strong">{summary.grandTotal}</td>
                            </tr>
                            </tbody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    );

};

export default AdminSalary;
