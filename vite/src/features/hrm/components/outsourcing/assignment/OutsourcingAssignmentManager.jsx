import { useEffect, useState } from "react";
import axios from "axios";

const OutsourcingAssignmentManager = () => {
    const [assignments, setAssignments] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [availableEmps, setAvailableEmps] = useState([]);
    const [allEmps, setAllEmps] = useState([]);
    const [definedProjects, setDefinedProjects] = useState([]);

    const [selectedCompany, setSelectedCompany] = useState(null);
    const [selectedProjectName, setSelectedProjectName] = useState("");
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [newProjectInput, setNewProjectInput] = useState("");

    const [roleFilter, setRoleFilter] = useState("ALL");
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    const [assignHistory, setAssignHistory] = useState([]);
    const [historyViewId, setHistoryViewId] = useState(null);

    const calculateStatus = (start, end) => {
        const today = new Date().toISOString().split('T')[0];
        if (!start) return "예정";
        if (start > today) return "예정";
        if (end && end < today) return "종료";
        return "진행중";
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case "진행중": return <span className="badge bg-success shadow-sm" style={{fontSize: '0.65rem'}}>진행중</span>;
            case "예정": return <span className="badge bg-primary shadow-sm" style={{fontSize: '0.65rem'}}>예정</span>;
            case "종료": return <span className="badge bg-danger shadow-sm" style={{fontSize: '0.65rem'}}>종료</span>;
            default: return <span className="badge bg-secondary" style={{fontSize: '0.65rem'}}>{status}</span>;
        }
    };

    const fetchInitialData = async () => {
        try {
            const [assignRes, compRes, empRes] = await Promise.all([
                axios.get("/back/hyun/outsourcing/selectAllAssignment", { withCredentials: true }),
                axios.get("/back/hyun/outsourcing/selectAllCompany", { withCredentials: true }),
                axios.get("/back/hyun/emp/selectAll", { withCredentials: true })
            ]);

            const assignData = assignRes.data || [];
            setAssignments(assignData);
            setCompanies(compRes.data || []);
            setAllEmps(empRes.data || []);

            const projectsFromDB = assignData.map(a => ({
                companyId: Number(a.companyId),
                projectName: a.projectName
            }));

            const uniqueProjects = projectsFromDB.filter((v, i, a) =>
                a.findIndex(t => (t.companyId === v.companyId && t.projectName === v.projectName)) === i
            );
            setDefinedProjects(uniqueProjects);

            const assignedIds = assignData.map(a => a.empId);
            const pool = (empRes.data || []).filter(e => !assignedIds.includes(e.empId));
            setAvailableEmps(pool.sort((a, b) => (a.empRole === "LEADER" ? -1 : 1)));
        } catch (e) { console.error("데이터 로딩 실패", e); }
    };

    const fetchAssignHistory = async (assignId) => {
        if (historyViewId === assignId) {
            setHistoryViewId(null);
            return;
        }
        try {
            const res = await axios.get(`/back/hyun/outsourcing/selectAssignmentHistory?assignmentId=${assignId}`, { withCredentials: true });
            // null 방지 처리
            setAssignHistory(res.data || []);
            setHistoryViewId(assignId);
            setEditingId(null);
        } catch (e) { console.error("배치 이력 로딩 실패", e); }
    };

    useEffect(() => { fetchInitialData(); }, []);

    const getProjectsForSelectedCompany = () => {
        if (!selectedCompany) return [];
        return definedProjects
            .filter(p => Number(p.companyId) === Number(selectedCompany.companyId))
            .map(p => p.projectName);
    };

    const handleRenameProject = async (oldName) => {
        const newName = prompt(`'${oldName}' 프로젝트의 새 이름을 입력하세요.\n이 프로젝트에 소속된 모든 인원이 일괄 수정됩니다.`, oldName);
        if (!newName || newName.trim() === "" || newName === oldName) return;

        try {
            await axios.put("/back/hyun/outsourcing/updateProjectName", {
                companyId: selectedCompany.companyId,
                oldProjectName: oldName,
                newProjectName: newName
            }, { withCredentials: true });

            alert("프로젝트명이 성공적으로 수정되었습니다.");
            await fetchInitialData();
            if (selectedProjectName === oldName) setSelectedProjectName(newName);
        } catch (e) { alert("수정 실패"); }
    };

    const handleAddProject = () => {
        if (!newProjectInput.trim()) return alert("프로젝트 명칭을 입력하세요.");
        const isDuplicate = definedProjects.some(
            p => Number(p.companyId) === Number(selectedCompany.companyId) && p.projectName === newProjectInput
        );
        if (isDuplicate) return alert("이미 등록된 프로젝트입니다.");
        setDefinedProjects([...definedProjects, { companyId: Number(selectedCompany.companyId), projectName: newProjectInput }]);
        setSelectedProjectName(newProjectInput);
        setNewProjectInput("");
        setIsCreatingNew(false);
    };

    const handleAssign = async (emp) => {
        if (!selectedProjectName) return alert("프로젝트를 선택해주세요.");
        const startDate = new Date().toISOString().split('T')[0];
        const newAssign = {
            empId: emp.empId,
            companyId: selectedCompany.companyId,
            projectName: selectedProjectName,
            startDate: startDate,
            endDate: "",
            status: calculateStatus(startDate, "")
        };
        try {
            await axios.post("/back/hyun/outsourcing/insertAssignment", newAssign, { withCredentials: true });
            fetchInitialData();
        } catch (e) { alert("배정 실패"); }
    };

    const handleUpdate = async () => {
        try {
            const updatedForm = { ...editForm, status: calculateStatus(editForm.startDate, editForm.endDate) };
            await axios.put("/back/hyun/outsourcing/updateAssignment", updatedForm, { withCredentials: true });
            setEditingId(null);
            fetchInitialData();
        } catch (e) { alert("수정 실패"); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("제거하시겠습니까?")) return;
        try {
            await axios.delete(`/back/hyun/outsourcing/deleteAssignment/${id}`, { withCredentials: true });
            fetchInitialData();
        } catch (e) { alert("제거 실패"); }
    };

    const getMembersInProject = () => {
        if (!selectedCompany || !selectedProjectName) return [];
        return assignments
            .filter(a => Number(a.companyId) === Number(selectedCompany.companyId) && a.projectName === selectedProjectName)
            .map(a => {
                const emp = allEmps.find(e => e.empId === a.empId);
                return { ...a, empName: emp?.empName || a.empId, empRole: emp?.empRole || "EMP" };
            })
            .sort((a, b) => (a.empRole === "LEADER" ? -1 : 1));
    };

    return (
        <div className="row g-0 border rounded shadow-sm bg-white" style={{ height: "80vh" }}>
            {/* 1. 협력 업체 선택 */}
            <div className="col-md-2 border-end h-100 overflow-auto bg-light">
                <div className="p-3 fw-bold border-bottom bg-white small text-secondary text-center">1. 협력 업체</div>
                <div className="list-group list-group-flush">
                    {companies.map(c => (
                        <button key={c.companyId}
                                onClick={() => { setSelectedCompany(c); setSelectedProjectName(""); setIsCreatingNew(false); }}
                                className={`list-group-item list-group-item-action border-0 py-3 ${selectedCompany?.companyId === c.companyId ? 'bg-primary text-white shadow-sm fw-bold' : ''}`}>
                            {c.companyName}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. 프로젝트 관리 */}
            <div className="col-md-3 border-end h-100 overflow-auto">
                <div className="p-3 fw-bold border-bottom bg-light small text-secondary text-center">2. 프로젝트 목록</div>
                {selectedCompany ? (
                    <div className="p-2">
                        {!isCreatingNew ? (
                            <button className="btn btn-sm btn-outline-dark w-100 mb-3 fw-bold" onClick={() => setIsCreatingNew(true)}>
                                <i className="bi bi-plus-lg me-1"></i> 프로젝트 추가
                            </button>
                        ) : (
                            <div className="p-2 mb-3 bg-white border border-primary rounded shadow-sm">
                                <input type="text" className="form-control form-control-sm mb-2" value={newProjectInput} onChange={e=>setNewProjectInput(e.target.value)} placeholder="프로젝트명" />
                                <div className="d-flex gap-1">
                                    <button className="btn btn-xs btn-primary flex-grow-1" onClick={handleAddProject}>생성하기</button>
                                    <button className="btn btn-xs btn-light border flex-grow-1" onClick={()=>setIsCreatingNew(false)}>취소하기</button>
                                </div>
                            </div>
                        )}
                        <div className="list-group">
                            {getProjectsForSelectedCompany().map(name => (
                                <div key={name} className="d-flex align-items-center mb-2 gap-1 px-1">
                                    <button onClick={() => { setSelectedProjectName(name); setEditingId(null); setHistoryViewId(null); }}
                                            className={`list-group-item list-group-item-action small py-2 border rounded flex-grow-1 text-truncate ${selectedProjectName === name ? 'bg-info text-white fw-bold border-info' : 'bg-white'}`}>
                                        <i className={`bi ${selectedProjectName === name ? 'bi-folder-fill' : 'bi-folder'} me-2`}></i>{name}
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleRenameProject(name); }}
                                            className="btn btn-xs btn-outline-secondary border d-flex align-items-center gap-1 flex-shrink-0"
                                            style={{ fontSize: '0.65rem', padding: '0.4rem 0.5rem' }}>
                                        <i className="bi bi-pencil-square"></i>
                                        <span>이름 수정</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : <div className="p-4 text-center text-muted small mt-5">업체를 먼저 선택해 주세요.</div>}
            </div>

            {/* 3. 인원 관리 메인 */}
            <div className="col-md-7 d-flex flex-column h-100 overflow-hidden bg-light">
                <div className="p-3 bg-white border-bottom shadow-sm d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-bold text-dark text-truncate">
                        {selectedProjectName ?
                            <span><span className="text-primary">{selectedCompany.companyName}</span> <i className="bi bi-chevron-right small px-1"></i> {selectedProjectName}</span>
                            : "프로젝트를 선택해 주세요"}
                    </h6>
                </div>

                {selectedProjectName ? (
                    <div className="row g-0 flex-grow-1 overflow-hidden">
                        <div className="col-md-6 border-end h-100 d-flex flex-column bg-white">
                            <div className="p-2 border-bottom fw-bold small bg-light text-center">투입 인력 현황</div>
                            <div className="flex-grow-1 overflow-auto">
                                {getMembersInProject().map(m => (
                                    <div key={m.assignmentId} className={`border-bottom p-3 ${historyViewId === m.assignmentId ? 'bg-info bg-opacity-10' : ''}`}>
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div>
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <span className="fw-bold">{m.empName}</span>
                                                    {m.empRole === 'LEADER' && <span className="badge bg-dark" style={{fontSize: '0.6rem'}}>팀장</span>}
                                                    {getStatusBadge(m.status)}
                                                </div>
                                                <div className="text-muted" style={{fontSize: '0.75rem'}}>
                                                    <i className="bi bi-calendar3 me-1"></i>{m.startDate} ~ {m.endDate || "진행중"}
                                                </div>
                                            </div>
                                            <div className="d-flex gap-1 flex-shrink-0">
                                                {/* 이력보기 버튼: 상태에 따라 텍스트 변경 */}
                                                <button onClick={() => fetchAssignHistory(m.assignmentId)} className={`btn btn-xs ${historyViewId === m.assignmentId ? 'btn-info text-white' : 'btn-outline-info'}`}>
                                                    {historyViewId === m.assignmentId ? "이력 닫기" : "이력 보기"}
                                                </button>
                                                <button onClick={() => { setEditingId(m.assignmentId); setEditForm({...m, endDate: m.endDate || ""}); setHistoryViewId(null); }} className="btn btn-xs btn-outline-primary">정보 수정</button>
                                                <button onClick={() => handleDelete(m.assignmentId)} className="btn btn-xs btn-outline-danger">인원 삭제</button>
                                            </div>
                                        </div>

                                        {/* 수정 폼 */}
                                        {editingId === m.assignmentId && (
                                            <div className="mt-2 p-2 bg-white rounded border border-primary shadow-sm">
                                                <div className="row g-1 mb-2">
                                                    <div className="col-6"><label className="x-small text-muted fw-bold">시작일</label><input type="date" className="form-control form-control-sm" value={editForm.startDate} onChange={e=>setEditForm({...editForm, startDate:e.target.value})} /></div>
                                                    <div className="col-6"><label className="x-small text-muted fw-bold">종료일</label><input type="date" className="form-control form-control-sm" value={editForm.endDate || ""} onChange={e=>setEditForm({...editForm, endDate:e.target.value})} /></div>
                                                </div>
                                                <div className="d-flex gap-1">
                                                    <button className="btn btn-xs btn-success flex-grow-1 fw-bold" onClick={handleUpdate}>수정 완료</button>
                                                    <button className="btn btn-xs btn-light border flex-grow-1" onClick={()=>setEditingId(null)}>수정 취소</button>
                                                </div>
                                            </div>
                                        )}

                                        {/* ⭐ 이력 상세 보기 영역 수정 ⭐ */}
                                        {historyViewId === m.assignmentId && (
                                            <div className="mt-2 p-3 bg-light border-start border-4 border-info rounded shadow-sm">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-bold x-small text-info">
                <i className="bi bi-clock-history me-1"></i>최근 변경 이력
            </span>
                                                    <span className="text-muted" style={{fontSize: '0.65rem'}}>최신순</span>
                                                </div>

                                                {assignHistory.length > 0 ? (
                                                    <div className="d-flex flex-column gap-2">
                                                        {assignHistory.map((h, idx) => (
                                                            <div key={idx} className="bg-white border p-2 rounded shadow-sm" style={{fontSize: '0.72rem'}}>
                                                                <div className="d-flex justify-content-between mb-1">
                            <span className="badge bg-secondary-subtle text-secondary" style={{fontSize: '0.6rem'}}>
                                {h.fieldName || "상태"}
                            </span>
                                                                    <span className="text-muted" style={{fontSize: '0.65rem'}}>
                                {h.createdAt?.split('T')[0]} {h.createdAt?.split('T')[1]?.substring(0, 5)}
                            </span>
                                                                </div>
                                                                <div className="d-flex align-items-center flex-wrap gap-1 mb-1">
                                                                    <span className="text-muted text-decoration-line-through">{h.beforeValue || "최초"}</span>
                                                                    <i className="bi bi-arrow-right text-primary"></i>
                                                                    <span className="fw-bold text-primary">{h.afterValue}</span>
                                                                </div>
                                                                {/* 변경자 정보 추가 */}
                                                                <div className="text-end border-top pt-1 mt-1" style={{fontSize: '0.65rem'}}>
                                                                    <span className="text-muted text-secondary">수정자: </span>
                                                                    <span className="fw-bold text-dark">{h.changerName}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="x-small text-muted p-3 text-center bg-white border rounded">
                                                        기록된 이력이 없습니다.
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="col-md-6 h-100 d-flex flex-column">
                            <div className="p-2 border-bottom bg-white d-flex justify-content-between align-items-center">
                                <span className="fw-bold small text-secondary">가용 인원 목록</span>
                                <div className="btn-group btn-group-sm">
                                    {["ALL", "LEADER", "EMP"].map(role => (
                                        <button key={role} className={`btn btn-xs ${roleFilter === role ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setRoleFilter(role)}>
                                            {role === "ALL" ? "전체 인원" : role === "LEADER" ? "팀장만" : "사원만"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-grow-1 overflow-auto p-2">
                                {availableEmps
                                    .filter(e => roleFilter === "ALL" || e.empRole === roleFilter)
                                    .map(e => (
                                        <div key={e.empId} className="p-2 px-3 border rounded bg-white mb-2 d-flex justify-content-between align-items-center shadow-sm">
                                            <div className="small">
                                                <div className="fw-bold d-flex align-items-center gap-2">
                                                    {e.empName} {e.empRole === 'LEADER' && <span className="badge bg-dark" style={{fontSize: '0.6rem'}}>팀장</span>}
                                                </div>
                                                <div className="text-muted" style={{fontSize: '0.65rem'}}>{e.empId}</div>
                                            </div>
                                            <button onClick={() => handleAssign(e)} className="btn btn-sm btn-primary py-0 px-3 shadow-sm fw-bold" style={{ borderRadius: '20px', fontSize: '0.7rem', height: '22px' }}>인력 배정하기</button>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-muted">
                        <i className="bi bi-arrow-left-circle mb-3 fs-1 opacity-25"></i>
                        <p className="fw-bold">왼쪽 리스트에서 프로젝트를 선택해 주세요.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OutsourcingAssignmentManager;