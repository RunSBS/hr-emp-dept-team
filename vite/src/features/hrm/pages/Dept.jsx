import { useState } from "react";
import DeptList from "../components/dept/DeptList";
import DeptDetail from "../components/dept/DeptDetail";

const Dept = () => {
    const [selectedDept, setSelectedDept] = useState(null); // 선택된 부서 정보
    const [refreshKey, setRefreshKey] = useState(0);       // 리스트 갱신 트리거

    // 등록/수정/삭제 후 실행될 콜백
    const handleSuccess = () => {
        setRefreshKey(prev => prev + 1);
        setSelectedDept(null);
    };

    return (
        <div style={{padding: "20px"}}>
            <h2>부서 관리</h2>
            <div style={{ display: "flex", height: "calc(100vh - 100px)", gap: "20px"}}>
                {/* 1. 좌측 부서 트리 영역 */}
                <div style={{ width: "350px", display: "flex", flexDirection: "column", border: "1px solid #eee", borderRadius: "8px", padding: "15px", backgroundColor: "#f9f9f9" }}>
                    <button
                        onClick={() => setSelectedDept({ isNew: true })}
                        style={{ marginBottom: "15px", padding: "10px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                    >
                        + 새 부서 등록
                    </button>
                    <div style={{ overflowY: "auto", flex: 1 }}>
                        <DeptList key={refreshKey} onSelectDept={setSelectedDept} />
                    </div>
                </div>
    
                {/* 2. 우측 상세 설정 영역 */}
                <div style={{ flex: 1, border: "1px solid #eee", borderRadius: "8px", padding: "20px" }}>
                    <DeptDetail
                        selectedDept={selectedDept}
                        onSuccess={handleSuccess}
                    />
                </div>
            </div>
        </div>
    );
};

export default Dept;