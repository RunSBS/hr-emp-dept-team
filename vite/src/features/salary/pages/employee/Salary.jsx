import React, { useMemo, useState } from "react";
import "../../styles/Salary.css";
import axios from "axios";
import { Card, Form, Button, Alert, Spinner, Table } from "react-bootstrap";

const Salary = () => {
    const [payMonth, setPayMonth] = useState("");
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState(null);

    const payMonthAsDate = useMemo(() => {
        if (!payMonth) return "";
        return `${payMonth}-01`;
    }, [payMonth]);

    const fetchMy = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get("/back/payroll/my/summary", {
                params: { payMonth: payMonthAsDate },
            });
            setSummary(res.data);
        } catch (e) {
            setError(e?.response?.data?.message || "조회 실패");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="salary-page">

            {/* ===== Header ===== */}
            <div className="sa-header">
                <h2 className="sa-title">나의 급여 조회</h2>
                <p className="sa-subtitle">
                    급여 월을 선택하여 나의 급여 산정 내역을 확인할 수 있습니다.
                </p>
            </div>

            {/* ===== Search Card ===== */}
            <div className="sa-card sa-search-card">
                <Form className="sa-filter">
                    <div className="sa-filter-item">
                        <div className="sa-label">급여 월</div>
                        <Form.Control
                            type="month"
                            value={payMonth}
                            onChange={(e) => setPayMonth(e.target.value)}
                        />
                    </div>

                    <div className="sa-filter-actions">
                        <Button onClick={fetchMy} disabled={loading || !payMonthAsDate}>
                            {loading ? <Spinner size="sm" animation="border" /> : "조회"}
                        </Button>
                    </div>
                </Form>

                {error && <Alert variant="danger" className="sa-alert">{error}</Alert>}
            </div>

            {/* ===== Summary Card ===== */}
            {summary && (
                <div className="sa-card sa-summary-card">
                    <div className="sa-summary-head">
                        <h5 className="sa-summary-title">급여 요약</h5>
                        <div className="sa-summary-month">{summary.payMonth}</div>
                    </div>

                    <div className="sa-table-wrap">
                        <Table bordered className="sa-table">
                            <tbody>
                            <tr>
                                <th>월 기본급</th>
                                <td>{summary.baseSalary}</td>
                                <th>정상 근무 분</th>
                                <td>{summary.totalNormalMinutes}</td>
                            </tr>
                            <tr>
                                <th>무급 공제 분</th>
                                <td>{summary.totalUnpaidMinutes}</td>
                                <th>월 급여</th>
                                <td>{summary.totalSalary}</td>
                            </tr>
                            <tr>
                                <th>야근 수당</th>
                                <td>{summary.totalOvAmount}</td>
                                <th>총 지급</th>
                                <td className="sa-grand"><b>{summary.grandTotal}</b></td>
                            </tr>
                            </tbody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Salary;
