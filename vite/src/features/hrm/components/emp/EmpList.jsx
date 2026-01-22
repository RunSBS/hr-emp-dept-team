import { useEffect, useState } from "react";
import axios from "axios";

/**
 * EmpList 컴포넌트
 * @param {Function} onSelectEmp - 사원 선택 시 호출될 함수
 * @param {string} searchTerm - 일반 검색어
 * @param {Array} customData - AI 검색 결과 데이터
 * @param {string} explanation - AI가 생성한 자연어 해설
 */
const EmpList = ({ onSelectEmp, searchTerm = "", customData = null, explanation = "" }) => {
    const [empList, setEmpList] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (customData) {
            setEmpList(customData);
        } else {
            fetchEmps();
        }
    }, [customData]);

    const fetchEmps = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/back/hyun/emp/selectAll", { withCredentials: true });
            setEmpList(res.data);
        } catch (e) {
            console.error("사원 목록 조회 실패", e);
        } finally {
            setLoading(false);
        }
    };

    const displayList = customData ? empList : empList.filter((emp) => {
        const term = searchTerm.toLowerCase();
        return (
            (emp.empName && emp.empName.toLowerCase().includes(term)) ||
            (emp.empId && emp.empId.toLowerCase().includes(term))
        );
    });

    return (
        <div style={{ width: "100%" }}>
            {/* --- AI 자연어 해설 가이드 영역 (수정됨) --- */}
            {explanation && (
                <div style={{
                    marginBottom: "15px",
                    padding: "12px",
                    backgroundColor: "#fff9db", // 밝은 노란색 계열로 가독성 향상
                    borderRadius: "8px",
                    border: "1px solid #ffe066",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                }}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
                        <span style={{ fontSize: "18px", marginRight: "8px" }}>💡</span>
                        <span style={{ fontWeight: "bold", color: "#856404", fontSize: "14px" }}>
                            AI 분석 결과 안내
                        </span>
                    </div>
                    <div style={{
                        color: "#495057",
                        fontSize: "13px",
                        lineHeight: "1.6",
                        paddingLeft: "26px"
                    }}>
                        {explanation}
                    </div>
                </div>
            )}

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                    <th style={{ padding: "12px 10px", width: "100px", textAlign: "center" }}>사번</th>
                    <th style={{ padding: "12px 10px", textAlign: "left" }}>이름</th>
                    <th style={{ padding: "12px 10px", width: "120px", textAlign: "center" }}>부서</th>
                    <th style={{ padding: "12px 10px", width: "100px", textAlign: "center" }}>직급</th>
                </tr>
                </thead>
                <tbody>
                {loading ? (
                    <tr><td colSpan="4" style={{ textAlign: "center", padding: "30px" }}>불러오는 중...</td></tr>
                ) : displayList.length > 0 ? (
                    displayList.map((emp) => (
                        <tr
                            key={emp.empId}
                            onClick={() => onSelectEmp(emp)}
                            style={{ cursor: "pointer", borderBottom: "1px solid #eee" }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f1f1f1"}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                            <td style={{ padding: "12px 10px", textAlign: "center" }}>{emp.empId}</td>
                            <td style={{ padding: "12px 10px", fontWeight: "bold" }}>{emp.empName}</td>
                            <td style={{ textAlign: "center", padding: "12px 10px" }}>
                                {/*
                                    1. emp.deptName (AI 검색 결과나 평면 DTO일 때)
                                    2. emp.dept?.deptName (일반 조회 fetch 조인 결과일 때)
                                    3. 모두 없으면 "미지정"
                                */}
                                {emp.deptName || (emp.dept && emp.dept.deptName) || "미지정"}
                            </td>
                            <td style={{ padding: "12px 10px", textAlign: "center" }}>
                                <span style={{
                                    fontSize: "11px",
                                    padding: "3px 8px",
                                    backgroundColor: "#e7f5ff",
                                    color: "#228be6",
                                    borderRadius: "12px"
                                }}>
                                    {emp.empRole}
                                </span>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="4" style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                            {customData ? "조건에 맞는 사원이 없습니다." : "등록된 사원이 없습니다."}
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

export default EmpList;