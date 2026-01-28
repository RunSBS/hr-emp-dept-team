import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Form, Button, Alert, Spinner } from "react-bootstrap";

const AdminSalaryPolicy = () => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [ok, setOk] = useState(null);

    // 서버에서 받은 정책(표시용)
    const [policy, setPolicy] = useState(null);

    // 수정 폼
    const [rateMultiplier, setRateMultiplier] = useState("");
    const [workMinutesPerMonth, setWorkMinutesPerMonth] = useState("");
    const [description, setDescription] = useState("");

    const fetchPolicy = async () => {
        setLoading(true);
        setError(null);
        setOk(null);
        try {
            const res = await axios.get("/back/admin/payroll/policy");
            const p = res.data;
            setPolicy(p);

            setRateMultiplier(p?.rateMultiplier ?? "");
            setWorkMinutesPerMonth(p?.workMinutesPerMonth ?? "");
            setDescription(p?.description ?? "");
        } catch (e) {
            setError("급여 정책 조회 실패");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPolicy();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setOk(null);

        // 간단 프론트 검증
        if (rateMultiplier === "" || Number.isNaN(Number(rateMultiplier))) {
            setError("배율(rateMultiplier)을 숫자로 입력해주세요. 예: 1.5");
            setSaving(false);
            return;
        }
        if (workMinutesPerMonth !== "" && Number.isNaN(Number(workMinutesPerMonth))) {
            setError("월 기준 근무분(workMinutesPerMonth)을 숫자로 입력해주세요.");
            setSaving(false);
            return;
        }

        try {
            const payload = {
                rateMultiplier: Number(rateMultiplier),
                workMinutesPerMonth: workMinutesPerMonth === "" ? null : Number(workMinutesPerMonth),
                description: description ?? "",
            };

            const res = await axios.patch("/back/admin/payroll/policy", payload);
            setPolicy(res.data);
            setOk("저장 완료");

            // 서버가 저장한 값으로 폼도 동기화
            setRateMultiplier(res.data?.rateMultiplier ?? "");
            setWorkMinutesPerMonth(res.data?.workMinutesPerMonth ?? "");
            setDescription(res.data?.description ?? "");
        } catch (e) {
            setError("급여 정책 저장 실패");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <h2 className="mb-4">급여 정책 관리</h2>

            <Card className="p-4 shadow-sm">
                {loading ? (
                    <div className="d-flex align-items-center gap-2">
                        <Spinner animation="border" size="sm" />
                        <span>불러오는 중...</span>
                    </div>
                ) : (
                    <>
                        {error && <Alert variant="danger">{error}</Alert>}
                        {ok && <Alert variant="success">{ok}</Alert>}

                        <div className="mb-3 text-muted">
                            {policy ? (
                                <>
                                    <div>
                                        현재 정책 ID: <b>{policy.payrollPolicyId ?? "-"}</b>
                                    </div>
                                    <div>
                                        updatedBy: <b>{policy.updatedBy ?? "-"}</b> / updatedAt:{" "}
                                        <b>{policy.updatedAt ?? "-"}</b>
                                    </div>
                                </>
                            ) : (
                                <div>현재 저장된 정책이 없습니다. 아래에서 저장하면 생성됩니다.</div>
                            )}
                        </div>

                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>연장수당 배율 (rateMultiplier)</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.01"
                                    value={rateMultiplier}
                                    onChange={(e) => setRateMultiplier(e.target.value)}
                                    placeholder="예: 1.5"
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>월 기준 근무분 (workMinutesPerMonth)</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={workMinutesPerMonth}
                                    onChange={(e) => setWorkMinutesPerMonth(e.target.value)}
                                    placeholder="예: 9600"
                                />
                                <Form.Text className="text-muted">
                                    비워도 됩니다(서버에서 기본값을 쓰거나, 급여계산에서 다른 기준을 쓸 수 있음).
                                </Form.Text>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>설명</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="정책 설명"
                                />
                            </Form.Group>

                            <div className="d-flex gap-2">
                                <Button onClick={handleSave} disabled={saving}>
                                    {saving ? "저장 중..." : "저장"}
                                </Button>
                                <Button variant="secondary" onClick={fetchPolicy} disabled={loading || saving}>
                                    새로고침
                                </Button>
                            </div>
                        </Form>
                    </>
                )}
            </Card>
        </div>
    );
};

export default AdminSalaryPolicy;
