import { useState } from "react";
import axios from "axios";

const EmpSelectAll = () => {
    const [empList, setEmpList] = useState([]);

    const handleClick = async () => {
        try {
            const res = await axios("/back/hyun/emp/selectAll");
            setEmpList(res.data);
            console.log("조회 결과 : ", res.data);
        } catch (e) {
            console.log("조회 실패 : ", e);
        }
    };

    return (
        <div>
            <h2>사원 목록</h2>
            {empList && (
                <div>
                    <table border="1">
                        <thead>
                        <tr>
                            <th>사원 번호</th>
                            <th>부서 번호</th>
                            <th>사원 이름</th>
                            <th>이메일</th>
                            <th>직급</th>
                            <th>생성일시</th>
                            <th>수정일시</th>
                        </tr>
                        </thead>

                        <tbody>
                        {empList.map((emp) => (
                            // key값과 필드명들을 DTO 이름과 동일하게 수정
                            <tr key={emp.empId}>
                                <td>{emp.empId}</td>
                                <td>{emp.deptId}</td>
                                <td>{emp.empName}</td>
                                <td>{emp.email}</td>
                                <td>{emp.role}</td>
                                <td>{emp.createdAt}</td>
                                <td>{emp.updatedAt}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
            <button onClick={handleClick}>사원 조회</button>
        </div>
    );
};

export default EmpSelectAll;