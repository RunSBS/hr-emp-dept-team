import { useState } from "react";
import OutsourcingAssignmentManager from "../components/outsourcing/assignment/OutsourcingAssignmentManager.jsx";
import OutsourcingCompanyManager from "../components/outsourcing/company/OutsourcingCompanyManager.jsx";

const Outsourcing = () => {
    const [subTab, setSubTab] = useState("company"); // company 또는 assignment

    return (
        <div style={{ padding: "20px", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
            <h2 className="mb-4 fw-bold">파견 및 외주 관리</h2>

            {/* 상단 탭 버튼 영역 */}
            <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
                <button
                    onClick={() => setSubTab("company")}
                    style={{
                        padding: "10px 25px",
                        backgroundColor: subTab === "company" ? "#007bff" : "#fff",
                        color: subTab === "company" ? "white" : "#555",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        boxShadow: subTab === "company" ? "0 4px 6px rgba(0,123,255,0.2)" : "none"
                    }}
                >
                    파견 업체 관리
                </button>
                <button
                    onClick={() => setSubTab("assignment")}
                    style={{
                        padding: "10px 25px",
                        backgroundColor: subTab === "assignment" ? "#007bff" : "#fff",
                        color: subTab === "assignment" ? "white" : "#555",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        boxShadow: subTab === "assignment" ? "0 4px 6px rgba(0,123,255,0.2)" : "none"
                    }}
                >
                    사원 배치 현황
                </button>
            </div>

            <div className="card shadow-sm border-0 p-4 bg-white" style={{ borderRadius: "12px" }}>
                {/* 서브 탭에 따른 컴포넌트 출력 */}
                {subTab === "company" ? <OutsourcingCompanyManager/> : <OutsourcingAssignmentManager />}
            </div>
        </div>
    );
}

export default Outsourcing;