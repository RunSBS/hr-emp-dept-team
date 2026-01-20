import { useEffect, useState } from "react";
import axios from "axios";

const EmpDetail = ({ selectedEmp, onSuccess }) => {
    const [activeTab, setActiveTab] = useState("info");
    const [history, setHistory] = useState([]);
    const [allDepts, setAllDepts] = useState([]); // 부서 선택용 리스트

    const [form, setForm] = useState({
        empId: "", empName: "", deptNo: "", email: "", hireDate: "", empRole: ""
    });

    useEffect(() => {
        // 부서 선택을 위한 부서 목록 로드
        axios.get("/back/hyun/dept/selectAll", { withCredentials: true })
            .then(res => setAllDepts(res.data));

        if (selectedEmp) {
            if (selectedEmp.isNew) {
                setActiveTab("edit");
                setForm({ empId: "", empName: "", deptNo: "", email: "", hireDate: "", empRole: "" });
                setHistory([]);
            } else {
                setActiveTab("info");
                setForm(selectedEmp);

                // 사원 변경 이력 조회
                axios.get(`/back/hyun/emp/selectHistory?empId=${selectedEmp.empId}`)
                    .then(res => setHistory(res.data))
                    .catch(err => console.error("이력 조회 실패", err));
            }
        }
    }, [selectedEmp]);

    // 방어 코드: 선택된 사원이 없으면 표시하지 않음
    if (!selectedEmp) {
        return (
            <div className="card shadow-sm border-0 d-flex align-items-center justify-content-center" style={{ minHeight: "400px" }}>
                <div className="text-center text-muted">
                    <p>사원을 선택하거나 신규 등록을 클릭해 주세요.</p>
                </div>
            </div>
        );
    }

    const handleInvite = async (emp) => {
        try {
            const res = await axios.post(
                "/back/invite/create",
                {
                    empId: emp.empId,
                    email: emp.email,
                },
                { withCredentials: true }
            );

            alert("초대 완료! inviteId = " + res.data);
        } catch (e) {
            console.log("초대 실패", e);
            alert("이미 초대된 사원일 수 있습니다.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        const isNew = selectedEmp.isNew;
        const url = isNew ? "/back/hyun/emp/insert" : "/back/hyun/emp/update";

        const submitData = {
            ...form,
            deptNo: form.deptNo ? parseInt(form.deptNo) : null
        };

        try {
            await axios({
                method: isNew ? "post" : "put",
                url,
                data: submitData,
                withCredentials: true
            });
            alert(isNew ? "등록되었습니다." : "수정되었습니다.");
            onSuccess();
        } catch (e) {
            const errorMsg = e.response?.status === 403
                ? "관리자 권한이 필요합니다."
                : (e.response?.data?.message || "작업에 실패했습니다.");
            alert(errorMsg);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        try {
            await axios({
                method: "delete",
                url: "/back/hyun/emp/delete",
                data: { empId: form.empId },
                withCredentials: true
            });
            alert("삭제되었습니다.");
            onSuccess();
        } catch (e) { alert("삭제 실패"); }
    };

    return (
        <div className="card shadow-sm border-0">
            {/* 탭 네비게이션 */}
            <div className="card-header bg-white pt-3">
                <ul className="nav nav-tabs border-0">
                    <li className="nav-item">
                        <button className={`nav-link border-0 ${activeTab === 'info' ? 'active fw-bold border-bottom border-primary border-3' : ''}`}
                                onClick={() => setActiveTab("info")} disabled={selectedEmp.isNew}>사원 정보</button>
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
                {/* 탭 1: 사원 정보 상세 */}
                {activeTab === "info" && (
                    <div className="row g-4">
                        <div className="col-md-6">
                            <label className="text-muted small">성명</label>
                            <div className="fw-bold border-bottom pb-2">{form.empName} ({form.empId})</div>
                        </div>
                        <div className="col-md-6">
                            <label className="text-muted small">직급</label>
                            <div className="fw-bold border-bottom pb-2">{form.empRole || "없음"}</div>
                        </div>
                        <div className="col-md-6">
                            <label className="text-muted small">이메일</label>
                            <div className="border-bottom pb-2">{form.email}</div>
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-primary py-0"
                                onClick={() => handleInvite(form)}
                                style={{ fontSize: '12px' }}>초대 메일 발송</button>
                        </div>
                        <div className="col-md-6">
                            <label className="text-muted small">입사일</label>
                            <div className="border-bottom pb-2">{form.hireDate}</div>
                        </div>
                        <div className="col-md-6">
                            <label className="text-muted small">소속 부서 번호</label>
                            <div className="border-bottom pb-2">{form.deptNo || "미지정"}</div>
                        </div>
                    </div>
                )}

                {/* 탭 2: 정보 수정 / 등록 */}
                {activeTab === "edit" && (
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label small fw-bold">사원 번호</label>
                            <input name="empId" className="form-control" value={form.empId} onChange={handleChange} disabled={!selectedEmp.isNew} placeholder="사번 입력" />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold">성명</label>
                            <input name="empName" className="form-control" value={form.empName} onChange={handleChange} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold">부서 선택</label>
                            <select name="deptNo" className="form-select" value={form.deptNo} onChange={handleChange}>
                                <option value="">부서 선택</option>
                                {allDepts.map(d => (
                                    <option key={d.deptNo} value={d.deptNo}>{d.deptName} ({d.deptNo})</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold">직급</label>
                            <select name="empRole" className="form-select" value={form.empRole} onChange={handleChange}>
                                <option value="">선택하세요</option>

                                <option value="CEO">CEO</option>

                                <option value="HR">인사 담당관</option>
                                <option value="ATTENDANCE">근태 담당관</option>
                                <option value="SCHEDULE">일정 담당관</option>
                                <option value="EVAL">평가 담당관</option>
                                <option value="REWARD">보상 담당관</option>

                                <option value="LEADER">팀장</option>

                                <option value="EMP">사원</option>
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold">이메일</label>
                            <input name="email" type="email" className="form-control" value={form.email} onChange={handleChange} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold">입사일</label>
                            <input name="hireDate" type="date" className="form-control" value={form.hireDate} onChange={handleChange} />
                        </div>
                        <div className="mt-4 d-flex gap-2">
                            <button onClick={handleSave} className="btn btn-primary px-4">저장하기</button>
                            {!selectedEmp.isNew && (
                                <button onClick={handleDelete} className="btn btn-outline-danger px-4">사원 삭제</button>
                            )}
                        </div>
                    </div>
                )}

                {/* 탭 3: 변경 이력 */}
                {activeTab === "history" && (
                    <div className="table-responsive border rounded">
                        <table className="table table-hover mb-0" style={{ fontSize: "13px" }}>
                            <thead className="table-light">
                            <tr>
                                <th style={{ width: '150px' }}>변경일시</th>
                                <th style={{ width: '100px' }}>변경자</th> {/* 변경자 컬럼 추가 */}
                                <th style={{ width: '100px' }}>항목</th>
                                <th>변경 상세</th>
                            </tr>
                            </thead>
                            <tbody>
                            {history.map(h => (
                                <tr key={h.empHistoryId}>
                                    <td style={{ whiteSpace: 'nowrap' }}>{h.createdAt}</td>
                                    {/* 변경자 이름 출력 */}
                                    <td className="fw-bold text-dark">{h.changerName}</td>
                                    <td className="fw-bold text-secondary">{h.fieldName}</td>
                                    <td>
                            <span className="text-muted text-decoration-line-through me-2">
                                {h.beforeValue || "없음"}
                            </span>
                                        <span className="text-primary fw-bold">
                                → {h.afterValue}
                            </span>
                                    </td>
                                </tr>
                            ))}
                            {history.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center py-5">변경 이력이 없습니다.</td>
                                </tr>
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