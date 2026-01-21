import { useState } from "react";
import axios from "axios";
import EmpList from "../components/emp/EmpList";
import EmpDetail from "../components/emp/EmpDetail";

const Emp = () => {
    const [selectedEmp, setSelectedEmp] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [aiQuestion, setAiQuestion] = useState(""); // AI 질문 상태
    const [aiResult, setAiResult] = useState(null);    // AI 검색 결과 데이터

    const handleSuccess = () => {
        setRefreshKey(prev => prev + 1);
        setSelectedEmp(null);
        setAiResult(null); // 검색 결과 초기화
    };

    // AI 검색 실행 함수
    const handleAISearch = async () => {
        if (!aiQuestion.trim()) return;
        try {
            const res = await axios.post("/ai/hyun/search/predict", { // /ai로 시작
                question: aiQuestion
            });
            if (res.data.status === "success") {
                setAiResult(res.data.data);
                console.log("AI가 생성한 SQL:", res.data.generated_sql);
            }
        } catch (e) {
            console.error("AI 검색 상세 에러:", e.response);
            alert("AI 검색 중 에러가 발생했습니다.");
        }
    };

    return (
        <div style={{padding: "20px"}}>
            <h2>사원 관리 시스템</h2>

            {/* AI 검색바 영역 */}
            <div style={{
                marginBottom: "20px", padding: "15px",
                backgroundColor: "#f0f7ff", borderRadius: "8px", border: "1px solid #cce5ff"
            }}>
                <div style={{ display: "flex", gap: "10px" }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="예: Java 경력 5년 이상인 사원 찾아줘"
                        value={aiQuestion}
                        onChange={(e) => setAiQuestion(e.target.value)}
                    />
                    <button className="btn btn-primary" style={{ whiteSpace: "nowrap" }} onClick={handleAISearch}>
                        AI 사원 찾기
                    </button>
                </div>
                {aiResult && <p className="small text-primary mt-2">🔍 AI 검색 결과: {aiResult.length}명이 발견되었습니다.</p>}
            </div>

            <div style={{ display: "flex", height: "calc(100vh - 250px)", gap: "20px"}}>
                <div style={{ width: "450px", display: "flex", flexDirection: "column", border: "1px solid #ddd", borderRadius: "8px", padding: "15px", backgroundColor: "#fff" }}>
                    <button
                        onClick={() => { setSelectedEmp({ isNew: true }); setAiResult(null); }}
                        style={{ marginBottom: "15px", padding: "12px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                    >
                        + 신규 사원 등록
                    </button>
                    <div style={{ overflowY: "auto", flex: 1 }}>
                        {/* aiResult가 있으면 AI 결과를, 없으면 기본 목록(refreshKey)을 보여줌 */}
                        <EmpList
                            key={refreshKey}
                            onSelectEmp={setSelectedEmp}
                            customData={aiResult}
                        />
                    </div>
                </div>

                <div style={{ flex: 1, border: "1px solid #ddd", borderRadius: "8px", padding: "20px", backgroundColor: "#fff", overflowY: "auto" }}>
                    <EmpDetail selectedEmp={selectedEmp} onSuccess={handleSuccess} />
                </div>
            </div>
        </div>
    );
};

export default Emp;