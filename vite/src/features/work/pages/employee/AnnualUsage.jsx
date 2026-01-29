import React, { useEffect, useMemo, useState } from "react";
import "../../styles/AnnualUsage.css";
import axios from "axios";
import { Table, Spinner, Alert, Form } from "react-bootstrap";

const AnnualUsage = () => {
    const [balances, setBalances] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ✅ 연도 필터 state 추가
    const [selectedYear, setSelectedYear] = useState("");

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

    // ✅ balances에서 연도 목록 만들기 (중복 제거)
    const years = useMemo(() => {
        const ys = Array.from(new Set((balances || []).map((b) => b.leaveYear)));
        ys.sort((a, b) => b - a); // 최신 연도 먼저
        return ys;
    }, [balances]);

    // ✅ 선택 연도에 따라 테이블 데이터 필터링
    const filteredBalances = useMemo(() => {
        if (!selectedYear) return balances;
        return balances.filter((b) => String(b.leaveYear) === String(selectedYear));
    }, [balances, selectedYear]);

    return (
        <div className="annual-usage-page">
            {/* ===== Header ===== */}
            <div className="au-header">
                <h2 className="au-title">나의 연차 사용 현황</h2>
                <p className="au-subtitle">
                    연도별 연차 부여, 사용, 잔여 현황을 확인할 수 있습니다.
                </p>
            </div>

            {/* ===== Filter ===== */}
            <div className="au-filter">
                <div className="au-filter-left">
                    <span className="au-filter-label">연도 선택</span>
                    <Form.Select
                        className="au-filter-select"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                    >
                        <option value="">전체 연도</option>
                        {years.map((y) => (
                            <option key={y} value={y}>
                                {y}년
                            </option>
                        ))}
                    </Form.Select>
                </div>
            </div>

            {/* ===== Loading / Alerts ===== */}
            {loading && (
                <div className="au-loading">
                    <Spinner animation="border" size="sm" />
                    불러오는 중...
                </div>
            )}

            {error && (
                <Alert className="au-alert" variant="danger">
                    {error}
                </Alert>
            )}

            {/* ===== Table ===== */}
            {!loading && filteredBalances.length > 0 && (
                <div className="au-card au-table-wrap">
                    <Table bordered hover responsive className="au-table">
                        <thead>
                        <tr>
                            <th>연도</th>
                            <th>총 연차</th>
                            <th>사용 연차</th>
                            <th>잔여 연차</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredBalances.map((b) => (
                            <tr key={b.balanceId}>
                                <td className="au-year">{b.leaveYear}</td>
                                <td>{b.totalLeaveMinutes / 480}일</td>
                                <td>{b.usedLeaveMinutes / 480}일</td>
                                <td className="au-remaining">
                                    {b.remainingLeaveMinutes / 480}일
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </div>
            )}

            {!loading && filteredBalances.length === 0 && (
                <Alert className="au-alert" variant="secondary">
                    조회된 연차 정보가 없습니다.
                </Alert>
            )}
        </div>
    );
};

export default AnnualUsage;
