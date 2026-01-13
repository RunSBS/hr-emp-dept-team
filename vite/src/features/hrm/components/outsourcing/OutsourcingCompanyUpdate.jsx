import {useState} from "react";
import axios from "axios";

const OutsourcingCompanyUpdate = () => {

    const [form, setForm] = useState({
        deptNo: "",    // 카멜케이스로 통일
        deptName: "",
        deptLoc: "",
        parentDeptNo: "",
        treeLevel: "",
        siblingOrder: ""
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
            const res = await axios.put("/back/hyun/dept/update",
                form,
                {withCredentials: true}
            );
            console.log("수정 성공 :", res.data);
            alert("사원 수정이 완료되었습니다.");
        } catch(e) {
            console.log("수정 실패 :", e);
            alert("수정 실패");
        }
    };

    return (
        <div>
            <h2>부서 수정</h2>

            <form onSubmit={handleSubmit}>
                <table>
                    <tbody>

                    <tr>
                        <th>
                            <label htmlFor="deptNo">부서 번호</label>
                        </th>
                        <td>
                            <input
                                id="deptNo"
                                name="deptNo" // DTO 필드명과 일치
                                type="number"
                                value={form.deptNo} // state 키값과 일치
                                onChange={handleChange}
                            />
                        </td>
                    </tr>

                    <tr>
                        <th>
                            <label htmlFor="deptName">부서명</label>
                        </th>
                        <td>
                            <input
                                id="deptName"
                                name="deptName" // DTO 필드명과 일치
                                value={form.deptName}
                                onChange={handleChange}
                            />
                        </td>
                    </tr>

                    <tr>
                        <th>
                            <label htmlFor="deptLoc">사내 부서 위치</label>
                        </th>
                        <td>
                            <input
                                id="deptLoc"
                                name="deptLoc" // DTO 필드명과 일치
                                type="text"
                                value={form.deptLoc}
                                onChange={handleChange}
                            />
                        </td>
                    </tr>

                    <tr>
                        <th>
                            <label htmlFor="parentDeptNo">상위 부서 번호</label>
                        </th>
                        <td>
                            <input
                                id="parentDeptNo"
                                name="parentDeptNo"
                                type="number"
                                value={form.parentDeptNo}
                                onChange={handleChange}
                            />
                        </td>
                    </tr>

                    <tr>
                        <th>
                            <label htmlFor="treeLevel">트리 내 계층</label>
                        </th>
                        <td>
                            <input
                                id="treeLevel"
                                name="treeLevel"
                                type="number"
                                value={form.treeLevel}
                                onChange={handleChange}
                            />
                        </td>
                    </tr>
                    <tr>
                        <th>
                            <label htmlFor="siblingOrder">트리 내 형제 순서</label>
                        </th>
                        <td>
                            <input
                                id="siblingOrder"
                                name="siblingOrder"
                                type="number"
                                value={form.siblingOrder}
                                onChange={handleChange}
                            />
                        </td>
                    </tr>
                    </tbody>
                </table>
                <button type="submit">부서 수정</button>
            </form>
        </div>
    );
};

export default OutsourcingCompanyUpdate;