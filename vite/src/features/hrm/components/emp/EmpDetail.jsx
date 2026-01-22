import { useEffect, useState } from "react";
import axios from "axios";

const EmpDetail = ({ selectedEmp, onSuccess }) => {
    const [activeTab, setActiveTab] = useState("info");
    const [history, setHistory] = useState([]);
    const [skills, setSkills] = useState([]);
    const [allDepts, setAllDepts] = useState([]);

    const [newSkill, setNewSkill] = useState({
        skillName: "",
        years: "",
        skillLevel: "중"
    });

    const [form, setForm] = useState({
        empId: "",
        empName: "",
        deptNo: "",
        email: "",
        hireDate: "",
        empRole: ""
    });

    useEffect(() => {
        axios.get("/back/hyun/dept/selectAll", { withCredentials: true })
            .then(res => setAllDepts(res.data))
            .catch(err => console.error("부서 목록 로드 실패", err));
    }, []);

    useEffect(() => {
        if (selectedEmp) {
            // 사번 추출 (대소문자 및 오타 방어)
            const targetId = selectedEmp.empId || selectedEmp.empid || selectedEmp.EMP_ID;

            if (selectedEmp.isNew) {
                setActiveTab("edit");
                setForm({ empId: "", empName: "", deptNo: "", email: "", hireDate: "", empRole: "" });
                setHistory([]);
                setSkills([]);
            } else {
                // 기존 데이터 세팅 시 dept 객체가 있다면 deptNo로 평탄화
                const dNo = selectedEmp.deptNo || (selectedEmp.dept ? selectedEmp.dept.deptNo : "");

                setForm({
                    ...selectedEmp,
                    empId: targetId,
                    deptNo: dNo
                });
                setHistory([]);
                setSkills([]);

                if (targetId) {
                    axios.get(`/back/hyun/emp/selectHistory?empId=${targetId}`)
                        .then(res => setHistory(res.data || []))
                        .catch(err => console.error("이력 조회 실패", err));
                    fetchSkills(targetId);
                }
            }
        }
    }, [selectedEmp]);

    const fetchSkills = async (empId) => {
        try {
            const res = await axios.get(`/back/hyun/empSkill/list?empId=${empId}`, { withCredentials: true });
            setSkills(res.data || []);
        } catch (e) { console.error("기술 스택 조회 실패", e); }
    };

    const handleAddSkill = async () => {
        if (!newSkill.skillName || !newSkill.years) return alert("입력 확인");
        try {
            await axios.post("/back/hyun/empSkill/insert", {
                empId: form.empId,
                skillName: newSkill.skillName,
                years: parseInt(newSkill.years),
                skillLevel: newSkill.skillLevel
            }, { withCredentials: true });
            setNewSkill({ skillName: "", years: "", skillLevel: "중" });
            fetchSkills(form.empId);
        } catch (e) { alert("기술 등록 실패"); }
    };

    const handleDeleteSkill = async (skillName) => {
        if (!window.confirm("삭제하시겠습니까?")) return;
        try {
            await axios.delete("/back/hyun/empSkill/delete", {
                data: { empId: form.empId, skillName },
                withCredentials: true
            });
            fetchSkills(form.empId);
        } catch (e) { alert("기술 삭제 실패"); }
    };

    const handleInvite = async (emp) => {
        try {
            await axios.post("/back/invite/create", { empId: emp.empId, email: emp.email }, { withCredentials: true });
            alert("초대 완료");
        } catch (e) { alert("초대 실패"); }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        const isNew = selectedEmp.isNew;
        const url = isNew ? "/back/hyun/emp/insert" : "/back/hyun/emp/update";

        // ⭐⭐⭐ [긴급 수정] 서버가 혼동하지 않도록 중첩된 'dept' 객체를 완전히 제거합니다.
        // restForm에서 dept를 명시적으로 빼내고 순수 필드만 보냅니다.
        const { dept, createdAt, updatedAt, ...restForm } = form;

        const submitData = {
            ...restForm,
            empId: form.empId || selectedEmp.empId || selectedEmp.empid,
            // deptNo가 null이거나 객체면 안 되므로 확실하게 처리
            deptNo: form.deptNo ? parseInt(form.deptNo) : (dept ? dept.deptNo : null)
        };

        console.log("최종 전송 데이터(정제완료):", submitData);

        if (!submitData.empId) {
            alert("사번이 없습니다.");
            return;
        }

        try {
            await axios({
                method: isNew ? "post" : "put",
                url,
                data: submitData,
                withCredentials: true
            });
            alert("완료되었습니다.");
            onSuccess();
        } catch (e) {
            alert(e.response?.data?.message || "처리 중 에러 발생");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("삭제하시겠습니까?")) return;
        try {
            await axios.delete("/back/hyun/emp/delete", { data: { empId: form.empId }, withCredentials: true });
            alert("삭제되었습니다.");
            onSuccess();
        } catch (e) { alert("삭제 실패"); }
    };

    if (!selectedEmp) return <div className="p-5 text-center text-muted">사원을 선택하세요.</div>;

    return (
        <div className="card shadow-sm border-0">
            <div className="card-header bg-white pt-3">
                <ul className="nav nav-tabs border-0">
                    <li className="nav-item">
                        <button className={`nav-link border-0 ${activeTab === 'info' ? 'active fw-bold border-bottom border-primary border-3' : ''}`}
                                onClick={() => setActiveTab("info")} disabled={selectedEmp.isNew}>사원 정보</button>
                    </li>
                    <li className="nav-item">
                        <button className={`nav-link border-0 ${activeTab === 'skills' ? 'active fw-bold border-bottom border-primary border-3' : ''}`}
                                onClick={() => setActiveTab("skills")} disabled={selectedEmp.isNew}>기술 스택</button>
                    </li>
                    <li className="nav-item">
                        <button className={`nav-link border-0 ${activeTab === 'edit' ? 'active fw-bold border-bottom border-primary border-3' : ''}`}
                                onClick={() => setActiveTab("edit")}>{selectedEmp.isNew ? "신규 등록" : "정보 수정"}</button>
                    </li>
                    <li className="nav-item">
                        <button className={`nav-link border-0 ${activeTab === 'history' ? 'active fw-bold border-bottom border-primary border-3' : ''}`}
                                onClick={() => setActiveTab("history")} disabled={selectedEmp.isNew}>변경 이력</button>
                    </li>
                </ul>
            </div>

            <div className="card-body p-4">
                {activeTab === "info" && (
                    <div className="row g-4">
                        <div className="col-md-6"><label className="text-muted small">성명</label><div className="fw-bold border-bottom pb-2">{form.empName} ({form.empId})</div></div>
                        <div className="col-md-6"><label className="text-muted small">직급</label><div className="fw-bold border-bottom pb-2">{form.empRole || "없음"}</div></div>
                        <div className="col-md-6">
                            <label className="text-muted small">이메일</label><div className="border-bottom pb-2">{form.email}</div>
                            <button className="btn btn-sm btn-outline-primary mt-1" onClick={() => handleInvite(form)}>초대 발송</button>
                        </div>
                        <div className="col-md-6"><label className="text-muted small">입사일</label><div className="border-bottom pb-2">{form.hireDate}</div></div>
                    </div>
                )}

                {activeTab === "skills" && (
                    <div className="animate__animated animate__fadeIn">
                        <div className="row g-2 mb-4 p-3 bg-light rounded border">
                            <div className="col-md-4">
                                <label className="small text-muted">기술명</label>
                                <input type="text" className="form-control form-control-sm" placeholder="예: React" value={newSkill.skillName} onChange={(e)=>setNewSkill({...newSkill, skillName: e.target.value})} />
                            </div>
                            <div className="col-md-3">
                                <label className="small text-muted">경력(년)</label>
                                <input type="number" className="form-control form-control-sm" placeholder="2" value={newSkill.years} onChange={(e)=>setNewSkill({...newSkill, years: e.target.value})} />
                            </div>
                            <div className="col-md-3">
                                <label className="small text-muted">숙련도</label>
                                <select className="form-select form-select-sm" value={newSkill.skillLevel} onChange={(e)=>setNewSkill({...newSkill, skillLevel: e.target.value})}>
                                    <option value="상">상</option><option value="중">중</option><option value="하">하</option>
                                </select>
                            </div>
                            <div className="col-md-2 d-flex align-items-end">
                                <button className="btn btn-sm btn-primary w-100" onClick={handleAddSkill}>추가</button>
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="table table-sm hover">
                                <thead className="table-light">
                                <tr><th>기술명</th><th>경력</th><th>숙련도</th><th className="text-center">삭제</th></tr>
                                </thead>
                                <tbody>
                                {skills.length > 0 ? skills.map((s, idx) => (
                                    <tr key={idx} className="align-middle">
                                        <td><span className="fw-bold">{s.skillName}</span></td>
                                        <td>{s.years}년</td>
                                        <td><span className={`badge ${s.skillLevel === '상' ? 'bg-success' : s.skillLevel === '중' ? 'bg-info' : 'bg-secondary'}`}>{s.skillLevel}</span></td>
                                        <td className="text-center">
                                            <button className="btn btn-link btn-sm text-danger p-0" onClick={()=>handleDeleteSkill(s.skillName)}>
                                                <i className="bi bi-trash"></i> 삭제
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" className="text-center py-4 text-muted">등록된 기술 스택이 없습니다.</td></tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}



                {activeTab === "edit" && (
                    <div className="row g-3">
                        <div className="col-md-6"><label className="form-label">사원 번호</label><input name="empId" className="form-control" value={form.empId || ""} onChange={handleChange} disabled={!selectedEmp.isNew} /></div>
                        <div className="col-md-6"><label className="form-label">성명</label><input name="empName" className="form-control" value={form.empName || ""} onChange={handleChange} /></div>
                        <div className="col-md-6">
                            <label className="form-label">부서</label>
                            <select name="deptNo" className="form-select" value={form.deptNo || ""} onChange={handleChange}>
                                <option value="">선택</option>
                                {allDepts.map(d => <option key={d.deptNo} value={d.deptNo}>{d.deptName}</option>)}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">직급</label>
                            <select name="empRole" className="form-select" value={form.empRole || ""} onChange={handleChange}>
                                <option value="JUNIOR">JUNIOR</option><option value="SENIOR">SENIOR</option><option value="LEADER">LEADER</option>
                            </select>
                        </div>
                        <div className="col-md-6"><label className="form-label">이메일</label><input name="email" className="form-control" value={form.email || ""} onChange={handleChange} /></div>
                        <div className="col-md-6"><label className="form-label">입사일</label><input name="hireDate" type="date" className="form-control" value={form.hireDate || ""} onChange={handleChange} /></div>
                        <div className="mt-4 gap-2 d-flex">
                            <button onClick={handleSave} className="btn btn-primary">저장</button>
                            {!selectedEmp.isNew && <button onClick={handleDelete} className="btn btn-outline-danger">삭제</button>}
                        </div>
                    </div>
                )}

                {activeTab === "history" && (
                    <div className="table-responsive border rounded animate__animated animate__fadeIn">
                        <table className="table table-hover mb-0" style={{ fontSize: '12px' }}>
                            <thead className="table-light">
                            <tr>
                                <th>변경일</th>
                                <th>변경자</th> {/* 컬럼 추가 */}
                                <th>항목</th>
                                <th>변경 내용</th>
                            </tr>
                            </thead>
                            <tbody>
                            {history.length > 0 ? history.map(h => (
                                <tr key={h.empHistoryId}>
                                    <td>{new Date(h.createdAt).toLocaleString()}</td>
                                    <td className="fw-bold">
                                        {/* 백엔드 DTO 구조에 따라 changerName 또는 changer.empName 선택 */}
                                        {h.changerName || (h.changer ? h.changer.empName : "시스템")}
                                    </td>
                                    <td><span className="badge bg-secondary">{h.fieldName}</span></td>
                                    <td>
                                        <span className="text-danger">{h.beforeValue || "없음"}</span>
                                        <i className="bi bi-arrow-right mx-2">→</i>
                                        <span className="text-success fw-bold">{h.afterValue}</span>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="4" className="text-center py-5 text-muted">변경 이력이 존재하지 않습니다.</td></tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmpDetail;