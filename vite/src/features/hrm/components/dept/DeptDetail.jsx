import { useEffect, useState } from "react";
import axios from "axios";

const DeptDetail = ({ selectedDept, onSuccess }) => {
    const [activeTab, setActiveTab] = useState("info");
    const [deptEmployees, setDeptEmployees] = useState([]);
    const [history, setHistory] = useState([]);
    const [allDepts, setAllDepts] = useState([]);

    const [form, setForm] = useState({
        deptNo: "",
        deptName: "",
        deptLoc: "",
        parentDeptNo: "",
        treeLevel: 0,
        siblingOrder: 1
    });

    useEffect(() => {
        // 모든 부서 목록 로드 (상위 부서 Select Box용)
        axios.get("/back/hyun/dept/selectAll", { withCredentials: true })
            .then(res => setAllDepts(res.data))
            .catch(err => console.error("부서 목록 로딩 실패", err));

        if (selectedDept) {
            if (selectedDept.isNew) {
                setActiveTab("edit");
                setForm({
                    deptNo: "",
                    deptName: "",
                    deptLoc: "",
                    parentDeptNo: "",
                    treeLevel: 0,
                    siblingOrder: 1
                });
                setDeptEmployees([]);
                setHistory([]);
            } else {
                setActiveTab("info");
                setForm({
                    ...selectedDept,
                    parentDeptNo: selectedDept.parentDeptNo || ""
                });

                // 해당 부서 사원 목록 조회
                axios.get(`/back/hyun/emp/selectEmpByDeptNo?deptno=${selectedDept.deptNo}`)
                    .then(res => setDeptEmployees(res.data));

                // 변경 이력 조회
                axios.get(`/back/hyun/dept/selectHistory?deptNo=${selectedDept.deptNo}`)
                    .then(res => setHistory(res.data));
            }
        }
    }, [selectedDept]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!form.deptName) return alert("부서명을 입력해주세요.");

        const url = selectedDept.isNew ? "/back/hyun/dept/insert" : "/back/hyun/dept/update";
        const submitData = {
            ...form,
            deptNo: parseInt(form.deptNo),
            parentDeptNo: form.parentDeptNo === "" ? null : parseInt(form.parentDeptNo),
            siblingOrder: parseInt(form.siblingOrder || 1)
        };

        try {
            await axios({
                method: selectedDept.isNew ? "post" : "put",
                url,
                data: submitData,
                withCredentials: true
            });
            alert("저장되었습니다.");
            onSuccess();
        } catch (err) {
            alert(err.response?.data?.message || "저장에 실패했습니다.");
        }
    };

    const handleDelete = async () => {
        // 유효성 검사 1: 소속 사원 존재 여부
        if (deptEmployees.length > 0) {
            return alert("해당 부서에 소속된 사원이 있어 삭제할 수 없습니다.");
        }

        // 유효성 검사 2: 하위 부서 존재 여부
        const hasChildren = allDepts.some(d => d.parentDeptNo === selectedDept.deptNo);
        if (hasChildren) {
            return alert("하위 부서가 존재하는 부서는 삭제할 수 없습니다.");
        }

        if (!window.confirm(`[${selectedDept.deptName}] 부서를 정말 삭제하시겠습니까?`)) return;

        try {
            await axios.delete(`/back/hyun/dept/delete/${selectedDept.deptNo}`, { withCredentials: true });
            alert("삭제되었습니다.");
            onSuccess();
        } catch (err) {
            alert(err.response?.data?.message || "삭제에 실패했습니다.");
        }
    };

    if (!selectedDept) {
        return (
            <div className="card shadow-sm border-0 d-flex align-items-center justify-content-center h-100 text-muted" style={{ minHeight: "400px" }}>
                <div className="text-center">
                    <i className="bi bi-info-circle mb-3" style={{ fontSize: "2rem" }}></i>
                    <p>좌측 조직도에서 부서를 선택하거나<br/>신규 부서를 등록해 주세요.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card shadow-sm border-0">
            {/* 상단 탭 및 삭제 버튼 */}
            <div className="card-header bg-white pt-3 d-flex justify-content-between align-items-end">
                <ul className="nav nav-tabs border-0">
                    <li className="nav-item">
                        <button className={`nav-link border-0 ${activeTab === 'info' ? 'active fw-bold border-bottom border-primary border-3' : ''}`}
                                onClick={() => setActiveTab("info")} disabled={selectedDept?.isNew}>정보 및 인원</button>
                    </li>
                    <li className="nav-item">
                        <button className={`nav-link border-0 ${activeTab === 'edit' ? 'active fw-bold border-bottom border-primary border-3' : ''}`}
                                onClick={() => setActiveTab("edit")}>{selectedDept?.isNew ? "신규 등록" : "수정"}</button>
                    </li>
                    <li className="nav-item">
                        <button className={`nav-link border-0 ${activeTab === 'history' ? 'active fw-bold border-bottom border-primary border-3' : ''}`}
                                onClick={() => setActiveTab("history")} disabled={selectedDept?.isNew}>이력</button>
                    </li>
                </ul>

                {activeTab === "edit" && !selectedDept.isNew && (
                    <button onClick={handleDelete} className="btn btn-sm btn-outline-danger mb-2 px-3">
                        <i className="bi bi-trash me-1"></i>부서 삭제
                    </button>
                )}
            </div>

            <div className="card-body p-4">
                {/* 1. 부서 정보 및 사원 리스트 탭 */}
                {activeTab === "info" && (
                    <div>
                        <div className="row g-3 mb-4">
                            <div className="col-md-4">
                                <div className="p-3 bg-light rounded shadow-sm text-center">
                                    <div className="small text-muted mb-1">부서번호</div>
                                    <div className="fw-bold h5 mb-0 text-primary">{form.deptNo}</div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="p-3 bg-light rounded shadow-sm text-center">
                                    <div className="small text-muted mb-1">부서 위치</div>
                                    <div className="fw-bold h5 mb-0">{form.deptLoc || "미지정"}</div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="p-3 bg-light rounded shadow-sm text-center">
                                    <div className="small text-muted mb-1">소속 인원</div>
                                    <div className="fw-bold h5 mb-0 text-success">{deptEmployees.length}명</div>
                                </div>
                            </div>
                        </div>

                        <h6 className="fw-bold mb-3"><i className="bi bi-people-fill me-2 text-secondary"></i>소속 사원 명단</h6>
                        <div className="table-responsive shadow-sm rounded">
                            <table className="table table-hover mb-0" style={{ fontSize: "14px" }}>
                                <thead className="table-dark">
                                <tr><th>사번</th><th>이름</th><th>직급</th><th>입사일</th></tr>
                                </thead>
                                <tbody>
                                {deptEmployees.map(emp => (
                                    <tr key={emp.empId}>
                                        <td className="text-muted">{emp.empId}</td>
                                        <td className="fw-bold">{emp.empName}</td>
                                        <td><span className="badge bg-secondary">{emp.empRole}</span></td>
                                        <td>{emp.hireDate}</td>
                                    </tr>
                                ))}
                                {deptEmployees.length === 0 && (
                                    <tr><td colSpan="4" className="text-center py-5 text-muted">소속된 사원이 없습니다.</td></tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 2. 등록 및 수정 폼 탭 */}
                {activeTab === "edit" && (
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-muted">부서 번호</label>
                            <input name="deptNo" type="number" className="form-control bg-light" value={form.deptNo} onChange={handleChange} disabled={!selectedDept.isNew} placeholder="자동 부여 또는 입력" />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-muted">부서명</label>
                            <input name="deptName" className="form-control border-primary" value={form.deptName} onChange={handleChange} placeholder="부서 이름 입력" />
                        </div>
                        <div className="col-md-12">
                            <label className="form-label small fw-bold text-muted">부서 위치</label>
                            <input name="deptLoc" className="form-control" value={form.deptLoc} onChange={handleChange} placeholder="예: 본사 3층" />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-muted">상위 부서</label>
                            <select name="parentDeptNo" className="form-select text-primary fw-medium" value={form.parentDeptNo} onChange={handleChange}>
                                <option value="">최상위 부서 (없음)</option>
                                {allDepts.filter(d => d.deptNo !== parseInt(form.deptNo)).map(d => (
                                    <option key={d.deptNo} value={d.deptNo}>
                                        {"  ".repeat(d.treeLevel)} {d.treeLevel > 0 ? "ㄴ " : ""}{d.deptName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small fw-bold text-muted">정렬 순서</label>
                            <input name="siblingOrder" type="number" className="form-control" value={form.siblingOrder} onChange={handleChange} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small fw-bold text-muted">트리 레벨</label>
                            <input className="form-control bg-light" value={form.treeLevel} readOnly />
                        </div>
                        <div className="mt-4 border-top pt-3 text-end">
                            <button onClick={handleSave} className="btn btn-primary px-5 shadow-sm py-2">
                                <i className="bi bi-save me-2"></i>{selectedDept.isNew ? "부서 등록" : "수정 내용 저장"}
                            </button>
                        </div>
                    </div>
                )}

                {/* 3. 변경 이력 탭 */}
                {activeTab === "history" && (
                    <div className="table-responsive border rounded shadow-sm">
                        <table className="table table-hover mb-0" style={{ fontSize: "13px" }}>
                            <thead className="table-light">
                            <tr><th>변경일시</th><th>항목</th><th>변경 상세</th><th>담당자</th></tr>
                            </thead>
                            <tbody>
                            {history.map(h => (
                                <tr key={h.deptHistoryId}>
                                    <td className="text-muted">{h.createdAt}</td>
                                    <td className="fw-bold">{h.fieldName}</td>
                                    <td>
                                        <span className="text-muted text-decoration-line-through me-2">{h.beforeValue || "없음"}</span>
                                        <i className="bi bi-arrow-right text-primary me-2"></i>
                                        <span className="text-primary fw-bold">{h.afterValue}</span>
                                    </td>
                                    <td>{h.changerName}</td>
                                </tr>
                            ))}
                            {history.length === 0 && (
                                <tr><td colSpan="4" className="text-center py-5 text-muted">기록된 이력이 없습니다.</td></tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeptDetail;