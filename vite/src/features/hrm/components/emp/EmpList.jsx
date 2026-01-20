import { useEffect, useState } from "react";
import axios from "axios";

const EmpList = ({ onSelectEmp }) => {
    const [empList, setEmpList] = useState([]);

    useEffect(() => {
        fetchEmps();
    }, []);

    const fetchEmps = async () => {
        try {
            const res = await axios.get("/back/hyun/emp/selectAll", { withCredentials: true });
            setEmpList(res.data);
        } catch (e) { console.error("조회 실패", e); }
    };

    return (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
            <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                <th style={{ padding: "10px" }}>사번</th>
                <th>이름</th>
                <th>부서</th>
                <th>직급</th>
            </tr>
            </thead>
            <tbody>
            {empList.map((emp) => (
                <tr
                    key={emp.empId}
                    onClick={() => onSelectEmp(emp)}
                    style={{ cursor: "pointer", borderBottom: "1px solid #eee" }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f1f1f1"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                    <td style={{ padding: "10px", textAlign: "center" }}>{emp.empId}</td>
                    <td style={{ fontWeight: "bold" }}>{emp.empName}</td>
                    <td style={{ textAlign: "center" }}>{emp.deptNo}</td>
                    <td style={{ textAlign: "center" }}>{emp.empRole}</td>
                </tr>
            ))}
            </tbody>
        </table>
    );
};

export default EmpList;