import {useState} from "react";
import axios from "axios";

const OutsourcingCompanyInsert = () => {

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
            const res = await axios.post("/back/hyun/dept/insert",
                form,
                {withCredentials: true}
            );
            console.log("등록 성공 :", res.data);
            alert("파견업체 등록이 완료되었습니다.");
        } catch(e) {
            console.log("등록 실패 :", e);
            alert("등록 실패");
        }
    };

    return (
        <div>
            <h2>파견업체 등록</h2>

            <form onSubmit={handleSubmit}>
                <table>
                    <tbody>
                    <tr>
                        <th>
                            <label htmlFor="deptName">업체명</label>
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
                            <label htmlFor="deptLoc">계약 시작일</label>
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
                            <label htmlFor="parentDeptNo">계약 종료일</label>
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
                    </tbody>
                </table>
                <button type="submit">업체 등록</button>
            </form>
        </div>
    );
};

export default OutsourcingCompanyInsert;