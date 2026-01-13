import {useState} from "react";
import axios from "axios";

const OutsourcingCompanyDelete = () => {

    const [form, setForm] = useState({
        deptNo: ""
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
            const res = await axios.delete("/back/hyun/dept/delete", {
             data : form,
             withCredentials: true
            });
            console.log("삭제 성공 :", res.data);
            alert("사원 삭제가 완료되었습니다.");
        } catch(e) {
            console.log("삭제 실패 :", e);
            alert("삭제 실패");
        }
    };

    return (
        <div>
            <h2>부서 삭제</h2>

            <form onSubmit={handleSubmit}>
                <table>
                    <tbody>
                    <tr>
                        <th>
                            <label htmlFor="deptNo">삭제할 부서 번호</label>
                        </th>
                        <td>
                            <input
                                id="deptNo"
                                name="deptNo" // DTO 필드명과 일치
                                type="text"
                                value={form.deptNo} // state 키값과 일치
                                onChange={handleChange}
                            />
                        </td>
                    </tr>
                    </tbody>
                </table>
                <button type="submit">부서 삭제</button>
            </form>
        </div>
    );
};

export default OutsourcingCompanyDelete;