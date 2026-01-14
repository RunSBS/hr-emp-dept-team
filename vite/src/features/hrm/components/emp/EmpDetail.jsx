import { useEffect, useState } from "react";
import axios from "axios";

const EmpDetail = ({ selectedEmp, onSuccess }) => {
    const [form, setForm] = useState({
        empId: "", empName: "", deptNo: "", email: "", empRole: ""
    });

    useEffect(() => {
        if (selectedEmp) {
            setForm(selectedEmp.isNew ? { empId: "", empName: "", deptNo: "", email: "", empRole: "" } : selectedEmp);
        }
    }, [selectedEmp]);

    if (!selectedEmp) return <div style={{ textAlign: "center", marginTop: "100px", color: "#888" }}>사원을 선택하거나 신규 등록을 클릭하세요.</div>;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        const isNew = selectedEmp.isNew;
        const url = isNew ? "/back/hyun/emp/insert" : "/back/hyun/emp/update";

        // 데이터 정제
        const submitData = {
            ...form,
            // 문자열로 들어오는 값을 숫자로 변환 (부서번호가 없을 땐 null)
            deptNo: form.deptNo ? parseInt(form.deptNo) : null
        };

        if (isNew && !form.empId) {
            alert("사원 번호를 입력해주세요.");
            return;
        }

        try {
            await axios({
                method: isNew ? "post" : "put",
                url,
                data: submitData,
                withCredentials: true
            });
            alert(isNew ? "사원이 등록되었습니다." : "사원 정보가 수정되었습니다.");
            onSuccess();
        } catch (e) {
            console.error("에러 발생:", e.response);
            // 서버에서 보낸 에러 메시지가 있다면 출력
            const errorMsg = e.response?.status === 403
                ? "등록 권한이 없습니다. (ADMIN 권한 필요)"
                : "작업 실패: 입력값을 확인하세요.";
            alert(errorMsg);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        try {
            await axios.delete("/back/hyun/emp/delete", { data: { empId: form.empId }, withCredentials: true });
            alert("삭제 완료");
            onSuccess();
        } catch (e) { alert("삭제 실패"); }
    };

    const handleInvite = async () => {
        try {
            await axios.post("/back/invite/create", { empId: form.empId, email: form.email }, { withCredentials: true });
            alert("초대 발송 완료");
        } catch (e) { alert("초대 실패"); }
    };

    return (
        <div>
            <h3>{selectedEmp.isNew ? "사원 등록" : "사원 상세/수정"}</h3>
            <hr />
            <table style={{ width: "100%", marginTop: "20px" }}>
                <tbody>
                <tr>
                    <th style={{ width: "120px", textAlign: "left" }}>사원번호</th>
                    <td><input name="empId" value={form.empId} onChange={handleChange} disabled={!selectedEmp.isNew} style={{ width: "100%", padding: "8px" }} /></td>
                </tr>
                <tr>
                    <th style={{ textAlign: "left" }}>성명</th>
                    <td><input name="empName" value={form.empName} onChange={handleChange} style={{ width: "100%", padding: "8px" }} /></td>
                </tr>
                <tr>
                    <th style={{ textAlign: "left" }}>부서번호</th>
                    <td><input name="deptNo" type="number" value={form.deptNo} onChange={handleChange} style={{ width: "100%", padding: "8px" }} /></td>
                </tr>
                <tr>
                    <th style={{ textAlign: "left" }}>이메일</th>
                    <td><input name="email" type="email" value={form.email} onChange={handleChange} style={{ width: "100%", padding: "8px" }} /></td>
                </tr>
                <tr>
                    <th style={{ textAlign: "left" }}>직급</th>
                    <td>
                        <select name="empRole" value={form.empRole} onChange={handleChange} style={{ width: "100%", padding: "8px" }}>
                            <option value="">선택하세요</option>
                            <option value="CEO">CEO</option>
                            <option value="HR">담당관 - 인사</option>
                            <option value="LEADER">팀장</option>
                            <option value="EMP">사원</option>
                        </select>
                    </td>
                </tr>
                </tbody>
            </table>

            <div style={{ marginTop: "30px", display: "flex", gap: "10px" }}>
                <button onClick={handleSave} style={{ padding: "10px 20px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                    {selectedEmp.isNew ? "등록" : "저장"}
                </button>
                {!selectedEmp.isNew && (
                    <>
                        <button onClick={handleInvite} style={{ padding: "10px 20px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>초대</button>
                        <button onClick={handleDelete} style={{ padding: "10px 20px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>삭제</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default EmpDetail;