import React, { useMemo, useState } from "react";
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
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <h2 className="mb-4">급여 관리</h2>

            <Card className="p-4 shadow-sm mb-3">
                {msg && <Alert variant="success">{msg}</Alert>}
                {error && <Alert variant="danger">{error}</Alert>}

                <Form className="d-flex flex-column gap-3">
                    <Form.Group>
                        <Form.Label>사번(empId)</Form.Label>
                        <Form.Control value={empId} onChange={(e) => setEmpId(e.target.value)} />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>급여 월(payMonth)</Form.Label>
                        <Form.Control type="month" value={payMonth} onChange={(e) => setPayMonth(e.target.value)} />
                        <div className="text-muted mt-1">전송값: {payMonthAsDate || "YYYY-MM-01"}</div>
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>연봉(annualSalary)</Form.Label>
                        <Form.Control type="number" value={annualSalary} onChange={(e) => setAnnualSalary(e.target.value)} />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>월 기본급(baseSalary)</Form.Label>
                        <Form.Control type="number" value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)} />
                    </Form.Group>

                    <div className="d-flex gap-2">
                        <Button onClick={handleUpsert} disabled={loading}>
                            {loading ? <Spinner size="sm" animation="border" /> : "급여 정보 저장(Upsert)"}
                        </Button>
                        <Button variant="danger" onClick={handleClose} disabled={loading}>
                            {loading ? <Spinner size="sm" animation="border" /> : "월 급여 마감"}
                        </Button>
                        <Button variant="secondary" onClick={fetchSummary} disabled={loading || !empId || !payMonthAsDate}>
                            조회
                        </Button>
                        <Button
                            variant="primary"
                            onClick={fetchMonthlyList}
                            disabled={loading || !payMonthAsDate}
                        >
                            월 전체 리스트 조회
                        </Button>
                    </div>
                </Form>
            </Card>
            {monthlyList.length > 0 && (
                <Card className="p-4 shadow-sm mt-3">
                    <h5 className="mb-3">월 전체 사원 급여 리스트</h5>
                    <Table bordered hover responsive>
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
                                <td><b>{r.grandTotal}</b></td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </Card>
            )}

            {summary && (
                <Card className="p-4 shadow-sm">
                    <h5 className="mb-3">급여 요약</h5>
                    <Table bordered>
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
                            <th>월 급여(total_salary)</th>
                            <td>{summary.totalSalary}</td>
                            <th>야근 분</th>
                            <td>{summary.totalOvertimeMinutes}</td>
                        </tr>
                        <tr>
                            <th>야근 수당(total_ov_amount)</th>
                            <td>{summary.totalOvAmount}</td>
                            <th>총 지급(grandTotal)</th>
                            <td><b>{summary.grandTotal}</b></td>
                        </tr>
                        </tbody>
                    </Table>
                </Card>
            )}
        </div>
    );
};

export default AdminSalary;
