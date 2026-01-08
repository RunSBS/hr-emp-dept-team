import {useState} from "react";
import axios from "axios";

const EmpInsert = () => {

    const [form, setForm] = useState({
        empId: "",    // 카멜케이스로 통일
        empName: "",
        deptId: "",
        email: "",
        role: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value // input의 name 속성값이 여기의 key가 됩니다.
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Spring Boot의 @RequestBody가 이 JSON 객체를 EmpDto로 변환합니다.
            const res = await axios.post("/back/hyun/emp/insert", form);
            console.log("등록 성공 :", res.data);
            alert("사원 등록이 완료되었습니다.");
        } catch(e) {
            console.log("등록 실패 :", e);
            alert("등록 실패");
        }
    };

    return (
        <div>
            <h2>사원 등록</h2>

            <form onSubmit={handleSubmit}>
                <table>
                    <tbody>

                    <tr>
                        <th>
                            <label htmlFor="empId">사원번호</label>
                        </th>
                        <td>
                            <input
                                id="empId"
                                name="empId" // DTO 필드명과 일치
                                type="number"
                                value={form.empId} // state 키값과 일치
                                onChange={handleChange}
                            />
                        </td>
                    </tr>

                    <tr>
                        <th>
                            <label htmlFor="empName">사원명</label>
                        </th>
                        <td>
                            <input
                                id="empName"
                                name="empName" // DTO 필드명과 일치
                                value={form.empName}
                                onChange={handleChange}
                            />
                        </td>
                    </tr>

                    <tr>
                        <th>
                            <label htmlFor="deptId">부서번호</label>
                        </th>
                        <td>
                            <input
                                id="deptId"
                                name="deptId" // DTO 필드명과 일치
                                type="number"
                                value={form.deptId}
                                onChange={handleChange}
                            />
                        </td>
                    </tr>

                    <tr>
                        <th>
                            <label htmlFor="email">이메일</label>
                        </th>
                        <td>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                            />
                        </td>
                    </tr>

                    <tr>
                        <th>
                            <label htmlFor="role">직급</label>
                        </th>
                        <td>
                            <input
                                id="role"
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                            />
                        </td>
                    </tr>

                    </tbody>
                </table>

                <button type="submit">사원 등록</button>
            </form>
        </div>
    );
};

export default EmpInsert;