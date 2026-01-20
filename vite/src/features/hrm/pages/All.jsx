import { useEffect, useState } from "react";
import axios from "axios";

const All = () => {
    const [summary, setSummary] = useState({
        totalEmp: 0,
        totalDept: 0,
        activeAssignment: 0,
        deptStats: []
    });

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                // 기존 API들을 활용해 데이터 가져오기
                const [empRes, deptRes, assignRes] = await Promise.all([
                    axios.get("/back/hyun/emp/selectAll", { withCredentials: true }),
                    axios.get("/back/hyun/dept/selectAll", { withCredentials: true }),
                    axios.get("/back/hyun/outsourcing/selectAllAssignment", { withCredentials: true })
                ]);

                // 부서별 인원수 계산 (예시 로직)
                const deptCounts = deptRes.data.map(dept => ({
                    name: dept.deptName,
                    count: empRes.data.filter(emp => emp.deptNo === dept.deptNo).length
                }));

                setSummary({
                    totalEmp: empRes.data.length,
                    totalDept: deptRes.data.length,
                    activeAssignment: assignRes.data.filter(a => a.status === "진행중").length,
                    deptStats: deptCounts
                });
            } catch (e) {
                console.error("통계 로딩 실패", e);
            }
        };

        fetchSummary();
    }, []);

    return (
        <div style={{ padding: "20px" }}>
            <h2 style={{ marginBottom: "25px" }}>인사 종합 대시보드</h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "30px" }}>
                <div style={cardStyle}>
                    <h4 style={{ fontSize: "16px", color: "#666" }}>총 사원 수</h4>
                    <p style={countStyle}>{summary.totalEmp}명</p>
                </div>
                <div style={cardStyle}>
                    <h4 style={{ fontSize: "16px", color: "#666" }}>운영 부서</h4>
                    <p style={countStyle}>{summary.totalDept}개</p>
                </div>
                <div style={cardStyle}>
                    <h4 style={{ fontSize: "16px", color: "#666" }}>현재 파견 인원</h4>
                    <p style={countStyle}>{summary.activeAssignment}명</p>
                </div>
            </div>

            <div style={{ display: "flex", gap: "20px" }}>
                <div style={{ flex: 1, border: "1px solid #eee", padding: "20px", borderRadius: "8px", backgroundColor: "#fff" }}>
                    <h4>인사 관리 알림</h4>
                    <ul style={{ listStyle: "none", padding: 0, marginTop: "15px" }}>
                        <li style={itemStyle}>🔹 신규 입사자 승인 대기 : 2건</li>
                        <li style={itemStyle}>🔹 파견 종료 예정 사원 (7일 이내) : {summary.activeAssignment}명</li>
                        <li style={itemStyle}>🔹 미배정 사원 현황 확인 필요</li>
                    </ul>
                </div>

                <div style={{ flex: 1, border: "1px solid #eee", padding: "20px", borderRadius: "8px", backgroundColor: "#fff" }}>
                    <h4>부서별 인원 현황</h4>
                    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "15px" }}>
                        <thead>
                        <tr style={{ textAlign: "left", borderBottom: "2px solid #f4f4f4", color: "#888" }}>
                            <th style={{ padding: "10px" }}>부서명</th>
                            <th style={{ textAlign: "right", padding: "10px" }}>인원</th>
                        </tr>
                        </thead>
                        <tbody>
                        {summary.deptStats.map((dept, idx) => (
                            <tr key={idx} style={{ borderBottom: "1px solid #f9f9f9" }}>
                                <td style={{ padding: "10px" }}>{dept.name}</td>
                                <td style={{ textAlign: "right", padding: "10px", fontWeight: "bold" }}>{dept.count}명</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
// ... 스타일 코드는 동일

const cardStyle = { padding: "20px", border: "1px solid #ddd", borderRadius: "12px", textAlign: "center", backgroundColor: "#fff" };
const countStyle = { fontSize: "32px", fontWeight: "bold", color: "#007bff", margin: "10px 0" };
const itemStyle = { padding: "10px 0", borderBottom: "1px solid #f9f9f9", fontSize: "14px" };

export default All;