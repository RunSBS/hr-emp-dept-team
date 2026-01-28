import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Spinner, Alert, Table, Button } from "react-bootstrap";

const SalaryPolicy = () => {
    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPolicy = async () => {
        setLoading(true);
        setError(null);
        try {
            // vite proxy 때문에 /back 붙여서 호출
            const res = await axios.get("/back/payroll/policy");
            setPolicy(res.data);
        } catch (e) {
            console.error(e);
            setError("급여 정책 조회 실패");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPolicy();
    }, []);

    return (
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <h2 className="mb-4">급여 정책</h2>

            <Card className="p-4 shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="text-muted">현재(최신) 적용 중인 급여 정책을 조회합니다.</div>
                    <Button variant="outline-secondary" onClick={fetchPolicy} disabled={loading}>
                        새로고침
                    </Button>
                </div>

                {loading && <Spinner animation="border" />}
                {error && <Alert variant="danger">{error}</Alert>}

                {!loading && !error && policy && (
                    <Table bordered>
                        <tbody>
                        <tr>
                            <th style={{ width: "220px" }}>연장근로 배율</th>
                            <td>{policy.rateMultiplier}</td>
                        </tr>
                        <tr>
                            <th>월 기준 근무분</th>
                            <td>{policy.workMinutesPerMonth}</td>
                        </tr>
                        <tr>
                            <th>설명</th>
                            <td>{policy.description ?? "-"}</td>
                        </tr>
                        <tr>
                            <th>마지막 수정자</th>
                            <td>{policy.updatedBy ?? "-"}</td>
                        </tr>
                        <tr>
                            <th>마지막 수정일</th>
                            <td>{policy.updatedAt ?? "-"}</td>
                        </tr>
                        </tbody>
                    </Table>
                )}

                {!loading && !error && !policy && (
                    <Alert variant="secondary">조회된 급여 정책이 없습니다.</Alert>
                )}
            </Card>
        </div>
    );
};

export default SalaryPolicy;
