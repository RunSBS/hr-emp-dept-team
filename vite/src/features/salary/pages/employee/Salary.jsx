import React, { useMemo, useState } from "react";
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
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <h2 className="mb-4">내 급여 조회</h2>

            <Card className="p-4 shadow-sm mb-3">
                <Form className="d-flex gap-2 align-items-end">
                    <Form.Group>
                        <Form.Label>급여 월</Form.Label>
                        <Form.Control type="month" value={payMonth} onChange={(e) => setPayMonth(e.target.value)} />
                    </Form.Group>
                    <Button onClick={fetchMy} disabled={loading || !payMonthAsDate}>
                        {loading ? <Spinner size="sm" animation="border" /> : "조회"}
                    </Button>
                </Form>

                {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
            </Card>

            {summary && (
                <Card className="p-4 shadow-sm">
                    <h5 className="mb-3">급여 요약</h5>
                    <Table bordered>
                        <tbody>
                        <tr>
                            <th>급여 월</th>
                            <td>{summary.payMonth}</td>
                            <th>월 기본급</th>
                            <td>{summary.baseSalary}</td>
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
                            <th>야근 수당</th>
                            <td>{summary.totalOvAmount}</td>
                        </tr>
                        <tr>
                            <th>총 지급</th>
                            <td colSpan="3"><b>{summary.grandTotal}</b></td>
                        </tr>
                        </tbody>
                    </Table>
                </Card>
            )}
        </div>
    );
};

export default Salary;
