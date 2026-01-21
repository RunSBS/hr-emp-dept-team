import { useEffect, useState } from "react";
import axios from "axios";

const EmpList = ({ onSelectEmp, searchTerm = "", customData = null }) => {
    const [empList, setEmpList] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // customData(AI 검색 결과)가 들어오면 서버 호출 없이 해당 데이터를 사용
        if (customData) {
            setEmpList(customData);
        } else {
            fetchEmps();
        }
    }, [customData]); // AI 검색 결과가 변경될 때마다 실행

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

    // 1. AI 검색 결과가 있을 때는 필터링 없이 그대로 보여줌
    // 2. 일반 리스트일 때는 searchTerm으로 필터링 적용
    const displayList = customData
        ? empList
        : empList.filter((emp) => {
            const term = searchTerm.toLowerCase();
            return (
                emp.empName.toLowerCase().includes(term) ||
                emp.empId.toLowerCase().includes(term)
            );
        });

    return (
        <div style={{ width: "100%" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                    <th style={{ padding: "12px 10px", width: "100px" }}>사번</th>
                    <th style={{ padding: "12px 10px" }}>이름</th>
                    <th style={{ padding: "12px 10px", width: "80px" }}>부서</th>
                    <th style={{ padding: "12px 10px", width: "80px" }}>직급</th>
                </tr>
                </thead>
                <tbody>
                {loading ? (
                    <tr>
                        <td colSpan="4" style={{ textAlign: "center", padding: "30px", color: "#666" }}>
                            데이터를 불러오는 중입니다...
                        </td>
                    </tr>
                ) : displayList.length > 0 ? (
                    displayList.map((emp) => (
                        <tr
                            key={emp.empId}
                            onClick={() => onSelectEmp(emp)}
                            style={{
                                cursor: "pointer",
                                borderBottom: "1px solid #eee",
                                transition: "background-color 0.2s"
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f1f1f1"}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                            <td style={{ padding: "12px 10px", textAlign: "center", color: "#666" }}>
                                {emp.empId}
                            </td>
                            <td style={{ padding: "12px 10px", fontWeight: "bold", color: "#333" }}>
                                {emp.empName}
                            </td>
                            <td style={{ padding: "12px 10px", textAlign: "center" }}>
                                {emp.deptNo}
                            </td>
                            <td style={{ padding: "12px 10px", textAlign: "center" }}>
                                    <span style={{
                                        fontSize: "12px",
                                        padding: "2px 6px",
                                        backgroundColor: "#e9ecef",
                                        borderRadius: "4px"
                                    }}>
                                        {emp.empRole}
                                    </span>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="4" style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                            {customData ? "AI 검색 결과가 없습니다." : (searchTerm ? `"${searchTerm}"에 대한 검색 결과가 없습니다.` : "등록된 사원이 없습니다.")}
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

export default EmpList;