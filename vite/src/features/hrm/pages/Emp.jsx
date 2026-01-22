import React, { useState } from "react";
import axios from "axios";
import EmpList from "../components/emp/EmpList";
import EmpDetail from "../components/emp/EmpDetail";

const Emp = () => {
    const [selectedEmp, setSelectedEmp] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    // AI 검색 관련 상태
    const [aiQuestion, setAiQuestion] = useState("");
    const [aiResult, setAiResult] = useState(null);
    const [aiExplanation, setAiExplanation] = useState("");

    // ⭐ 로딩 상태 추가 (검색 중 UI 제어)
    const [loading, setLoading] = useState(false);

    // 초기화 핸들러
    const handleReset = () => {
        setAiQuestion("");
        setAiResult(null);
        setAiExplanation("");
        setSelectedEmp(null);
        setLoading(false);
        setRefreshKey(prev => prev + 1);
    };

    // 등록/수정/삭제 성공 시 호출
    const handleSuccess = () => {
        setRefreshKey(prev => prev + 1);
        setSelectedEmp(null);
        setAiResult(null);
        setAiExplanation("");
        setLoading(false);
    };

    // AI 검색 실행 함수
    const handleAISearch = async () => {
        if (!aiQuestion.trim()) {
            return;
        }

        setLoading(true); // 로딩 시작
        try {
            const res = await axios.post("/ai/hyun/search/predict", {
                question: aiQuestion
            });

            if (res.data.status === "success") {
                setAiResult(res.data.data);
                setAiExplanation(res.data.explanation);
            } else if (res.data.status === "fail") {
                setAiResult([]);
                setAiExplanation(res.data.explanation);
            }
        } catch (e) {
            console.error("AI 검색 에러:", e);
        } finally {
            setLoading(false); // 로딩 종료
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2 style={{ marginBottom: "20px" }}>사원 관리 시스템</h2>

            {/* --- AI 검색바 영역 --- */}
            <div style={{
                marginBottom: "20px",
                padding: "15px",
                backgroundColor: "#f0f7ff",
                borderRadius: "8px",
                border: "1px solid #cce5ff"
            }}>
                <div style={{ display: "flex", gap: "10px" }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder={loading ? "AI가 데이터를 분석하고 있습니다..." : "예: 개발1팀 사원 중 경력 제일 높은 사람"}
                        value={aiQuestion}
                        onChange={(e) => setAiQuestion(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !loading) handleAISearch();
                        }}
                        disabled={loading} // 로딩 중 입력 방지
                        style={{ flex: 1 }}
                    />

                    {/* AI 검색 버튼 (스피너 포함) */}
                    <button
                        className="btn btn-primary"
                        onClick={handleAISearch}
                        disabled={loading || !aiQuestion.trim()}
                        style={{ minWidth: "130px" }}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                분석 중...
                            </>
                        ) : (
                            "AI 사원 찾기"
                        )}
                    </button>

                    <button
                        className="btn btn-outline-secondary"
                        onClick={handleReset}
                        disabled={loading}
                        title="전체 목록 보기"
                    >
                        <i className="bi bi-arrow-clockwise"></i> 초기화
                    </button>
                </div>

                {aiResult && !loading && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                        <p className="small text-primary" style={{ marginBottom: 0 }}>
                            🔍 {aiResult.length === 0 ? "검색 결과가 없습니다." : `조회 결과: ${aiResult.length}명이 발견되었습니다.`}
                        </p>
                    </div>
                )}
            </div>

            <div style={{ display: "flex", height: "calc(100vh - 250px)", gap: "20px" }}>
                {/* --- 왼쪽: 사원 목록 영역 --- */}
                <div style={{
                    width: "450px",
                    display: "flex",
                    flexDirection: "column",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "15px",
                    backgroundColor: "#fff",
                    position: "relative" // 로딩 오버레이를 위한 기준점
                }}>
                    <button
                        onClick={() => {
                            setSelectedEmp({ isNew: true });
                            setAiResult(null);
                            setAiExplanation("");
                        }}
                        disabled={loading}
                        style={{
                            marginBottom: "15px",
                            padding: "12px",
                            backgroundColor: loading ? "#ccc" : "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: loading ? "not-allowed" : "pointer",
                            fontWeight: "bold"
                        }}
                    >
                        + 신규 사원 등록
                    </button>

                    <div style={{ overflowY: "auto", flex: 1 }}>
                        {/* 목록 영역 로딩 오버레이 */}
                        {loading ? (
                            <div className="d-flex flex-column align-items-center justify-content-center"
                                 style={{ height: "100%", backgroundColor: "rgba(255,255,255,0.9)", zIndex: 10 }}>
                                <div className="spinner-grow text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <h6 className="mt-3 fw-bold text-primary">AI 분석 중</h6>
                                <p className="text-muted small text-center">
                                    조건에 맞는 사원을 추출하고 있습니다.<br/>잠시만 기다려주세요.
                                </p>
                            </div>
                        ) : (
                            <EmpList
                                key={refreshKey}
                                onSelectEmp={setSelectedEmp}
                                customData={aiResult}
                                explanation={aiExplanation}
                            />
                        )}
                    </div>
                </div>

                {/* --- 오른쪽: 상세 정보 영역 --- */}
                <div style={{
                    flex: 1,
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "20px",
                    backgroundColor: "#fff",
                    overflowY: "auto"
                }}>
                    {/* 로딩 중일 때는 상세정보 창에 반투명 효과를 주어 수정을 방지할 수 있습니다 */}
                    <div style={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? "none" : "auto" }}>
                        <EmpDetail
                            selectedEmp={selectedEmp}
                            onSuccess={handleSuccess}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Emp;