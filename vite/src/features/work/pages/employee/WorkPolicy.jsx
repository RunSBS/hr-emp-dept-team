import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Spinner, Alert } from "react-bootstrap";

const WorkPolicy = () => {
    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ===============================
    // 현재 근태 정책 조회
    // ===============================
    const fetchCurrentPolicy = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get("/back/admin/attendance-policy/current");
            setPolicy(res.data);
        } catch (err) {
            console.error(err);
            setError("현재 적용 중인 근태 정책을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrentPolicy();
    }, []);

    return (
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <h2 className="mb-4">근태 정책 및 법정 기준</h2>

            {/* ===============================
          회사 근태 기준
      =============================== */}
            <Card className="p-4 mb-4 shadow-sm">
                <h4>📌 회사 근태 기준</h4>

                {loading && <Spinner animation="border" />}
                {error && <Alert variant="danger">{error}</Alert>}

                {policy && (
                    <>
                        <p>출근 시간: {String(policy.startTime).padStart(4, "0").slice(0, 2)}:
                            {String(policy.startTime).padStart(4, "0").slice(2)}</p>

                        <p>지각 기준: {String(policy.lateTime).padStart(4, "0").slice(0, 2)}:
                            {String(policy.lateTime).padStart(4, "0").slice(2)}</p>

                        <p>야근 시작: {String(policy.overtimeStart).padStart(4, "0").slice(0, 2)}:
                            {String(policy.overtimeStart).padStart(4, "0").slice(2)}</p>

                        <small style={{ color: "gray" }}>
                            * 회사 내부 정책에 따라 변경될 수 있습니다.
                        </small>
                    </>
                )}
            </Card>

            {/* ===============================
          법정 근로 기준
      =============================== */}
            <Card className="p-4 shadow-sm">
                <h4>📌 법정 근로 기준 (수정 불가)</h4>
                <ul>
                    <li>법정 근로시간: 1일 8시간, 주 40시간</li>
                    <li>연장근로: 1주 최대 12시간</li>
                    <li>연차 유급휴가: 1년간 80% 이상 출근 시 15일</li>
                    <li>연차 사용 촉진 제도는 근로기준법 제61조에 따름</li>
                </ul>
                <small style={{ color: "gray" }}>
                    * 본 내용은 근로기준법에 따른 법정 기준으로 수정할 수 없습니다.
                </small>
            </Card>
        </div>
    );
};

export default WorkPolicy;
