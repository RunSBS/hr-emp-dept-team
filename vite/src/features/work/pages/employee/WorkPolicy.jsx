import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Alert, Spinner } from "react-bootstrap";

const WorkPolicy = () => {
    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const formatTime = (hhmm) => {
        if (hhmm == null) return "-";
        const s = String(hhmm).padStart(4, "0");
        return `${s.slice(0, 2)}:${s.slice(2)}`;
    };

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                const res = await axios.get("/back/work-policy/current");
                setPolicy(res.data);
            } catch (e) {
                setError("근태 정책을 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchPolicy();
    }, []);

    if (loading) return <Spinner animation="border" />;
    if (error) return <Alert variant="danger">{error}</Alert>;
    if (!policy) return <Alert variant="secondary">적용 중인 정책이 없습니다.</Alert>;

    return (
        <Card className="p-4 shadow-sm" style={{ maxWidth: "700px", margin: "0 auto" }}>
            <h4 className="mb-3">현재 근태 정책</h4>
            <p>시작 시간: {formatTime(policy.startTime)}</p>
            <p>지각 기준: {formatTime(policy.lateTime)}</p>
            <p>야근 시작: {formatTime(policy.overtimeStart)}</p>
            <p>휴게 시간: {formatTime(policy.breakStart)} ~ {formatTime(policy.breakEnd)}</p>
            <p>설명: {policy.description || "-"}</p>
            <p>적용 기간: {policy.effectiveFrom} ~ {policy.effectiveTo}</p>
        </Card>
    );
};

export default WorkPolicy;
