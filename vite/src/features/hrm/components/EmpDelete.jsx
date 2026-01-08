import {useState} from "react";
import axios from "axios";

const EmpDelete = () => {

    const [form, setForm] = useState({
        empId: ""
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
            const res = await axios.delete("/back/hyun/emp/delete", {
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
            <h2>사원 삭제</h2>

            <form onSubmit={handleSubmit}>
                <table>
                    <tbody>
                    <tr>
                        <th>
                            <label htmlFor="empId">삭제할 사원 번호</label>
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
                    </tbody>
                </table>
                <button type="submit">사원 삭제</button>
            </form>
        </div>
    );
};

export default EmpDelete;