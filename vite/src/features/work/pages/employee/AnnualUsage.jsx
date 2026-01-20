import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Spinner, Alert } from "react-bootstrap";

const AnnualUsage = () => {
    const [balances, setBalances] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /* ===============================
       최초 로딩
    =============================== */
    useEffect(() => {
        fetchBalances();
    }, []);

    /* ===============================
       내 연차 조회
    =============================== */
    const fetchBalances = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await axios.get("/back/employee/leave-balance");
            setBalances(res.data || []);
        } catch (e) {
            setError("연차 정보 조회 실패");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <h2 className="mb-4">내 연차 사용 현황</h2>

            {loading && <Spinner animation="border" />}
            {error && <Alert variant="danger">{error}</Alert>}

            {!loading && balances.length > 0 && (
                <Table bordered hover>
                    <thead>
                    <tr>
                        <th>연도</th>
                        <th>총 연차</th>
                        <th>사용 연차</th>
                        <th>잔여 연차</th>
                    </tr>
                    </thead>
                    <tbody>
                    {balances.map((b) => (
                        <tr key={b.balanceId}>
                            <td>{b.leaveYear}</td>
                            <td>{b.totalLeaveMinutes / 480}일</td>
                            <td>{b.usedLeaveMinutes / 480}일</td>
                            <td>{b.remainingLeaveMinutes / 480}일</td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            )}

            {!loading && balances.length === 0 && (
                <Alert variant="secondary">
                    조회된 연차 정보가 없습니다.
                </Alert>
            )}
        </div>
    );
};

export default AnnualUsage;
