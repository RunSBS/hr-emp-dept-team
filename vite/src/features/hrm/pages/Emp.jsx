import { useState } from "react";
import EmpList from "../components/emp/EmpList";
import EmpDetail from "../components/emp/EmpDetail";

const Emp = () => {
    const [selectedEmp, setSelectedEmp] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleSuccess = () => {
        setRefreshKey(prev => prev + 1); // 목록 새로고침 트리거
        setSelectedEmp(null); // 선택 초기화
    };

    return (
        <div style={{padding: "20px"}}>
            <h2>사원 관리</h2>
            <div style={{ display: "flex", height: "calc(100vh - 150px)", gap: "20px"}}>
                {/* 좌측: 사원 목록 영역 */}
                <div style={{ width: "450px", display: "flex", flexDirection: "column", border: "1px solid #ddd", borderRadius: "8px", padding: "15px", backgroundColor: "#fff" }}>
                    <button
                        onClick={() => setSelectedEmp({ isNew: true })}
                        style={{ marginBottom: "15px", padding: "12px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                    >
                        + 신규 사원 등록
                    </button>
                    <div style={{ overflowY: "auto", flex: 1 }}>
                        <EmpList key={refreshKey} onSelectEmp={setSelectedEmp} />
                    </div>
                </div>

                {/* 우측: 상세/등록/수정 폼 영역 */}
                <div style={{ flex: 1, border: "1px solid #ddd", borderRadius: "8px", padding: "20px", backgroundColor: "#fff", overflowY: "auto" }}>
                    <EmpDetail
                        selectedEmp={selectedEmp}
                        onSuccess={handleSuccess}
                    />
                </div>
            </div>
        </div>
    );
};

export default Emp;