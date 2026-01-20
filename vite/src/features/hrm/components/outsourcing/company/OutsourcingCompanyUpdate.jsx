import {useState} from "react";
import axios from "axios";

const OutsourcingCompanyUpdate = () => {

    const [form, setForm] = useState({
        companyName: "",
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
            const res = await axios.put("/back/hyun/outsourcing/updateCompany",
                form,
                {withCredentials: true}
            );
            console.log("수정 성공 :", res.data);
            alert("파견업체 수정이 완료되었습니다.");
        } catch(e) {
            console.log("수정 실패 :", e);
            alert("수정 실패");
        }
    };

    return (
        <div>
            <h2>파견업체명 변경</h2>

            <form onSubmit={handleSubmit}>
                <table>
                    <tbody>

                    <tr>
                        <th>
                            <label htmlFor="companyName">기존 업체명</label>
                        </th>
                        <td>
                            <input
                                id="companyName"
                                name="companyName" // DTO 필드명과 일치
                                type="number"
                                value={form.companyName} // state 키값과 일치
                                onChange={handleChange}
                            />
                        </td>
                    </tr>
                    </tbody>
                </table>
                <button type="submit">파견업체 수정</button>
            </form>
        </div>
    );
};

export default OutsourcingCompanyUpdate;