import React, { useEffect, useState } from "react";
import "../../styles/SalaryPolicy.css";
import axios from "axios";
import { Alert, Spinner } from "react-bootstrap";

const SalaryPolicy = () => {
    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 숫자 포맷
    const formatNum = (v) => {
        if (v === null || v === undefined || v === "") return "-";
        const n = Number(v);
        if (Number.isNaN(n)) return String(v);
        return n.toLocaleString("ko-KR");
    };

    // 퍼센트/배율 포맷
    const formatMultiplier = (v) => {
        if (v === null || v === undefined || v === "") return "-";
        const n = Number(v);
        if (Number.isNaN(n)) return String(v);
        return `${n}`;
    };

    useEffect(() => {
        const fetchPolicy = async () => {
            setLoading(true);
            setError(null);
            try {
                // ✅ 너희 프로젝트 엔드포인트에 맞게 수정
                const res = await axios.get("/back/payroll/policy");
                setPolicy(res.data);
            } catch (e) {
                setError("급여 정책을 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchPolicy();
    }, []);

    if (loading) {
        return (
            <div className="salarypolicy-page">
                <div className="sp-loading">
                    <Spinner animation="border" size="sm" />
                    불러오는 중...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="salarypolicy-page">
                <Alert className="sp-alert" variant="danger">
                    {error}
                </Alert>
            </div>
        );
    }

    return (
        <div className="salarypolicy-page">
            {/* ===== Header ===== */}
            <div className="sp-header">
                <h2 className="sp-title">급여 정책 조회</h2>
                <p className="sp-subtitle">
                    회사에서 설정한 급여 계산 기준과 공제/가산 관련 안내를 확인할 수 있습니다.
                </p>
            </div>

            {/* =========================
          회사 급여 정책 카드
      ========================= */}
            <div className="sp-card">
                <div className="sp-card-head">
                    <div>
                        <h3 className="sp-card-title">회사 급여 정책</h3>
                        <p className="sp-card-sub">
                            아래 값은 시스템에 저장된 현재 정책 기준입니다.
                        </p>
                    </div>

                    {policy && (
                        <div className="sp-card-meta">
                            <div className="sp-meta">
                                정책 ID: <b>{policy.payrollPolicyId ?? "-"}</b>
                            </div>
                        </div>
                    )}
                </div>

                {!policy ? (
                    <div className="sp-item">
                        <div className="sp-item-title">정책 정보</div>
                        <div className="sp-item-desc">현재 저장된 급여 정책이 없습니다.</div>
                    </div>
                ) : (
                    <div className="sp-grid">
                        {/* 연장수당 배율 */}
                        <div className="sp-item">
                            <div className="sp-item-title">연장수당 배율</div>
                            <div className="sp-item-desc">
                                연장근로 가산은{" "}
                                <span className="sp-pill">{formatMultiplier(policy.rateMultiplier)}</span>{" "}
                                배 기준으로 계산될 수 있습니다.
                            </div>
                        </div>

                        {/* 월 기준 근무분 */}
                        <div className="sp-item">
                            <div className="sp-item-title">월 기준 근무분</div>
                            <div className="sp-item-desc">
                                월 기준 근무분은{" "}
                                <span className="sp-pill">{formatNum(policy.workMinutesPerMonth)}</span>{" "}
                                분으로 설정되어 있습니다.
                            </div>
                        </div>

                        {/* (선택) 기타 정책 값이 있으면 추가로 노출 */}
                        <div className="sp-item sp-item-wide">
                            <div className="sp-item-title">안내</div>
                            <div className="sp-item-desc">
                                지각/조퇴/결근으로 <b>근로를 제공하지 않은 시간</b>은 해당 시간만큼 급여 산정에서
                                제외될 수 있습니다. (아래 근로기준법 요약 참고)
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* =========================
          근로기준법(급여/공제 관련) 카드
      ========================= */}
            <div className="sp-card">
                <div className="sp-card-head">
                    <div>
                        <h3 className="sp-card-title">근로기준법 (급여/공제 관련)</h3>
                        <p className="sp-card-sub">
                            아래 내용은 근로기준법 조항 취지를 바탕으로 한 <b>요약</b>입니다.
                        </p>
                    </div>
                </div>

                <div className="sp-law-list">
                    <div className="sp-law-item">
                        <div className="sp-law-badge">임금 전액지급</div>
                        <div className="sp-law-text">
                            임금은 원칙적으로 <b>통화로 직접</b>, 그리고 <b>전액</b>을 지급해야 합니다.
                            (법에서 정한 예외 또는 적법한 공제 요건을 충족해야 함)
                        </div>
                    </div>

                    <div className="sp-law-item">
                        <div className="sp-law-badge">위약예정 금지</div>
                        <div className="sp-law-text">
                            “지각하면 ○만원 공제”처럼 <b>벌금처럼 미리 정해 깎는 방식</b>의 위약금/손해배상
                            예정은 제한됩니다. 즉, <b>근로 제공 안 한 시간</b>과는 별개로,
                            <b>추가 페널티 공제</b>는 신중해야 합니다.
                        </div>
                    </div>

                    <div className="sp-law-item">
                        <div className="sp-law-badge">감급(징계) 한도</div>
                        <div className="sp-law-text">
                            징계로 임금을 깎는 <b>감급</b>을 하더라도, 법에서 정한 <b>한도</b>를 넘기지 않도록
                            제한됩니다. (취업규칙/징계 규정 운영 시 주의)
                        </div>
                    </div>

                    <div className="sp-law-item">
                        <div className="sp-law-badge">가산임금</div>
                        <div className="sp-law-text">
                            연장·야간·휴일근로는 통상임금의 <b>가산</b>이 붙어 지급되어야 합니다.
                            (연장/야간/휴일 여부에 따라 계산 기준이 달라질 수 있음)
                        </div>
                    </div>
                </div>

                <div className="sp-law-footer">
                    우리 회사는 위 근로기준법 취지를 준수하여 <b>급여 정책</b>을 운영하고 있습니다.
                </div>
            </div>
        </div>
    );
};

export default SalaryPolicy;
