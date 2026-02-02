import React, { useEffect, useState } from "react";
import "../../styles/WorkPolicy.css";
import axios from "axios";
import { Alert, Spinner } from "react-bootstrap";

const WorkPolicy = () => {
    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ HHmm(예: 600, "930", 1830) -> "06:00", "09:30", "18:30"
    const formatHHmm = (v) => {
        if (v === null || v === undefined || v === "") return "-";
        const n = Number(v);
        if (Number.isNaN(n)) return String(v);

        const hh = String(Math.floor(n / 100)).padStart(2, "0");
        const mm = String(n % 100).padStart(2, "0");
        return `${hh}:${mm}`;
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

    // ✅ 로딩/에러/없음 화면도 페이지 레이아웃 안에서 보여주기
    if (loading) {
        return (
            <div className="workpolicy-page">
                <div className="wp-card">
                    <div className="d-flex align-items-center gap-2">
                        <Spinner animation="border" size="sm" />
                        <span>불러오는 중...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="workpolicy-page">
                <Alert variant="danger">{error}</Alert>
            </div>
        );
    }

    if (!policy) {
        return (
            <div className="workpolicy-page">
                <Alert variant="secondary">적용 중인 정책이 없습니다.</Alert>
            </div>
        );
    }

    return (
        <div className="workpolicy-page">
            {/* ===== Header ===== */}
            <div className="wp-header">
                <h2 className="wp-title">근태 정책 조회</h2>
                <p className="wp-subtitle">
                    회사에서 설정한 근태 기준 시간과 적용 기간을 확인할 수 있습니다.
                </p>
            </div>

            {/* =========================
          회사 근태 정책 카드
      ========================= */}
            <div className="wp-card">
                <div className="wp-card-head">
                    <div>
                        <h3 className="wp-card-title">회사 근태 정책</h3>
                        <p className="wp-card-sub">
                            아래 기준 시간은 <b>HH:mm</b> 형식으로 표시됩니다.
                        </p>
                    </div>

                    {/* (선택) 메타가 있으면 표시 */}
                    <div className="wp-card-meta">
                        <div className="wp-meta">
                            정책 ID: <b>{policy.policyId ?? "-"}</b>
                        </div>
                    </div>
                </div>

                <div className="wp-grid">
                    {/* 출근 기준 */}
                    <div className="wp-item">
                        <div className="wp-item-title">출근 기준</div>
                        <div className="wp-item-desc">
                            시스템 상{" "}
                            <span className="wp-pill">{formatHHmm(policy.startTime)}</span>{" "}
                            이후에 <b>출근하기</b> 버튼이 눌러집니다. 유의해주시길 바랍니다.
                        </div>
                    </div>

                    {/* 지각 기준 */}
                    <div className="wp-item">
                        <div className="wp-item-title">지각 기준</div>
                        <div className="wp-item-desc">
                            시스템 상{" "}
                            <span className="wp-pill">{formatHHmm(policy.lateTime)}</span>{" "}
                            이후 출근 시 <b>지각</b>으로 처리될 수 있습니다.
                        </div>
                    </div>

                    {/* 야근 시작 */}
                    <div className="wp-item">
                        <div className="wp-item-title">야근 시작</div>
                        <div className="wp-item-desc">
                            시스템 상{" "}
                            <span className="wp-pill">{formatHHmm(policy.overtimeStart)}</span>{" "}
                            이후 근무는 <b>연장근로</b>로 분류될 수 있습니다.
                        </div>
                    </div>

                    {/* 휴게 시간 */}
                    <div className="wp-item">
                        <div className="wp-item-title">휴게 시간</div>
                        <div className="wp-item-desc">
                            휴게 시간은{" "}
                            <span className="wp-pill">{formatHHmm(policy.breakStart)}</span>{" "}
                            ~{" "}
                            <span className="wp-pill">{formatHHmm(policy.breakEnd)}</span>{" "}
                            로 설정되어 있습니다.
                        </div>
                    </div>

                    {/* 적용 기간 */}
                    <div className="wp-item wp-item-wide">
                        <div className="wp-item-title">적용 기간</div>
                        <div className="wp-item-desc">
              <span className="wp-pill wp-pill-wide">
                {policy.effectiveFrom ?? "-"} ~ {policy.effectiveTo ?? "-"}
              </span>
                        </div>
                        <div className="wp-item-note">
                            해당 기간 동안 현재의 근태 정책이 적용됩니다.
                        </div>
                    </div>
                </div>
            </div>

            {/* =========================
          근로기준법 카드
      ========================= */}
            <div className="wp-card">
                <div className="wp-card-head">
                    <div>
                        <h3 className="wp-card-title">근로기준법</h3>
                        <p className="wp-card-sub">
                            아래 내용은 대한민국의 근로기준법을 바탕으로 한 <b>요약</b>입니다.
                        </p>
                    </div>
                </div>

                <div className="wp-law-list">
                    <div className="wp-law-item">
                        <div className="wp-law-badge">제50조</div>
                        <div className="wp-law-text">
                            <b>1주 40시간</b>, <b>1일 8시간</b>(휴게시간 제외)을 초과할 수 없습니다.
                        </div>
                    </div>

                    <div className="wp-law-item">
                        <div className="wp-law-badge">제53조</div>
                        <div className="wp-law-text">
                            당사자 간 합의가 있더라도 <b>1주 12시간</b>을 한도로 연장근로가 가능합니다.
                            <div style={{ marginTop: 6 }}>
                                즉, <b>제50조(40시간) + 제53조(12시간)</b> 기준으로 <b>주 52시간 준수</b>가 필요합니다.
                            </div>
                        </div>
                    </div>

                    <div className="wp-law-item">
                        <div className="wp-law-badge">제54조</div>
                        <div className="wp-law-text">
                            근로시간이 <b>4시간</b>이면 <b>30분 이상</b>, <b>8시간</b>이면 <b>1시간 이상</b>의
                            휴게시간을 부여해야 하며, 근로자는 이를 <b>자유롭게 이용</b>할 수 있어야 합니다.
                        </div>
                    </div>

                    <div className="wp-law-item">
                        <div className="wp-law-badge">제56조</div>
                        <div className="wp-law-text">
                            연장·야간(22:00~06:00) 및 휴일 근로에 대해서는 통상임금의 <b>50% 이상</b>을
                            가산하여 지급해야 합니다.
                        </div>
                    </div>
                </div>

                <div className="wp-law-footer">
                    우리 회사는 위 근로기준법을 준수하여 <b>근태 정책</b>을 운영하고 있습니다.
                </div>
            </div>
        </div>
    );
};

export default WorkPolicy;
