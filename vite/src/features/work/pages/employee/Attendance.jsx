import React, { useState } from "react";
import axios from "axios";
import { Button, Card, Alert, Spinner } from "react-bootstrap";

const Attendance = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleCheckIn = () => {
        setLoading(true);
        setError(null);
        setResult(null);

        if (!navigator.geolocation) {
            setError("위치 정보를 지원하지 않는 브라우저입니다.");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;

                    const res = await axios.post("/back/work/check-in", {
                        latitude,
                        longitude,
                    });

                    setResult(res.data);
                } catch (err) {
                    console.error(err);
                    setError(
                        err.response?.data?.message ||
                        "출근 처리 중 오류가 발생했습니다."
                    );
                } finally {
                    setLoading(false);
                }
            },
            () => {
                setError("위치 정보 접근이 거부되었습니다.");
                setLoading(false);
            }
        );
    };

    return (
        <div style={{ maxWidth: "500px", margin: "0 auto" }}>
            <h2 className="mb-4">출퇴근 기록</h2>

            <Card className="p-4 shadow-sm">
                <Button
                    variant="primary"
                    onClick={handleCheckIn}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Spinner size="sm" animation="border" /> 처리 중...
                        </>
                    ) : (
                        "출근하기"
                    )}
                </Button>

                {result && (
                    <Alert variant="success" className="mt-4">
                        <div><strong>상태:</strong> {result.workStatus}</div>
                        <div><strong>유형:</strong> {result.workType}</div>
                        <div>{result.message}</div>
                    </Alert>
                )}

                {error && (
                    <Alert variant="danger" className="mt-4">
                        {error}
                    </Alert>
                )}
            </Card>
        </div>
    );
};

export default Attendance;
