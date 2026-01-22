import { useState } from "react";
import OutsourcingAssignmentManager from "../components/outsourcing/OutsourcingAssignmentManager.jsx";
import OutsourcingCompanyManager from "../components/outsourcing/OutsourcingCompanyManager.jsx";

const Outsourcing = () => {
    // 탭 상태값도 가독성을 위해 명확하게 관리 (company -> companies, assignment -> projects)
    const [subTab, setSubTab] = useState("company");

    return (
        <div style={{ padding: "20px", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
            <div className="d-flex align-items-center mb-4 gap-2">
                <i className="bi bi-person-workspace text-primary fs-3"></i>
                <h2 className="mb-0 fw-bold">외주 인력 및 프로젝트 관리</h2>
            </div>

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
                        boxShadow: subTab === "company" ? "0 4px 12px rgba(0,123,255,0.15)" : "none",
                        transition: "all 0.2s ease"
                    }}
                >
                    <i className="bi bi-building me-2"></i>
                    협력 업체 등록
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
                        boxShadow: subTab === "assignment" ? "0 4px 12px rgba(0,123,255,0.15)" : "none",
                        transition: "all 0.2s ease"
                    }}
                >
                    <i className="bi bi-person-plus me-2"></i>
                    프로젝트 인력 배정
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