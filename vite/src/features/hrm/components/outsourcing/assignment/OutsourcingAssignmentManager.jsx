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

    // 날짜 기반 상태 계산
    const calculateStatus = (start, end) => {
        const today = new Date().toISOString().split('T')[0];
        if (!start) return "예정";
        if (start > today) return "예정";
        if (end && end < today) return "종료";
        return "진행중";
    };

    // 상태 배지 (진행중, 종료, 예정)
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

            // 기존 DB 데이터에서 프로젝트 목록 추출 (업체별 격리용)
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

    useEffect(() => { fetchInitialData(); }, []);

    const getProjectsForSelectedCompany = () => {
        if (!selectedCompany) return [];
        return definedProjects
            .filter(p => Number(p.companyId) === Number(selectedCompany.companyId))
            .map(p => p.projectName);
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
            {/* 1. 업체 선택 */}
            <div className="col-md-2 border-end h-100 overflow-auto bg-light">
                <div className="p-3 fw-bold border-bottom bg-white small">1. 업체 선택</div>
                <div className="list-group list-group-flush">
                    {companies.map(c => (
                        <button key={c.companyId}
                                onClick={() => { setSelectedCompany(c); setSelectedProjectName(""); setIsCreatingNew(false); }}
                                className={`list-group-item list-group-item-action border-0 py-3 ${selectedCompany?.companyId === c.companyId ? 'bg-primary text-white' : ''}`}>
                            {c.companyName}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. 프로젝트 관리 */}
            <div className="col-md-3 border-end h-100 overflow-auto">
                <div className="p-3 fw-bold border-bottom bg-light small">2. 프로젝트 관리</div>
                {selectedCompany ? (
                    <div className="p-2">
                        {!isCreatingNew ? (
                            <button className="btn btn-sm btn-dark w-100 mb-3 shadow-sm" onClick={() => setIsCreatingNew(true)}>+ 신규 등록</button>
                        ) : (
                            <div className="p-2 mb-3 bg-white border border-primary rounded shadow-sm">
                                <input type="text" className="form-control form-control-sm mb-2" value={newProjectInput} onChange={e=>setNewProjectInput(e.target.value)} placeholder="프로젝트명" />
                                <div className="d-flex gap-1">
                                    <button className="btn btn-xs btn-primary flex-grow-1" onClick={handleAddProject}>생성</button>
                                    <button className="btn btn-xs btn-light border flex-grow-1" onClick={()=>setIsCreatingNew(false)}>취소</button>
                                </div>
                            </div>
                        )}
                        <div className="list-group">
                            {getProjectsForSelectedCompany().map(name => (
                                <button key={name} onClick={() => { setSelectedProjectName(name); setEditingId(null); }}
                                        className={`list-group-item list-group-item-action small py-2 ${selectedProjectName === name ? 'bg-info text-white' : ''}`}>
                                    <i className="bi bi-folder me-2"></i>{name}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : <div className="p-4 text-center text-muted small mt-5">업체를 선택하세요.</div>}
            </div>

            {/* 3. 인원 관리 */}
            <div className="col-md-7 d-flex flex-column h-100 overflow-hidden bg-light">
                <div className="p-3 bg-white border-bottom shadow-sm">
                    <h6 className="mb-0 fw-bold text-primary">
                        {selectedProjectName ? <span><i className="bi bi-building me-2"></i>{selectedCompany.companyName} &gt; {selectedProjectName}</span> : "프로젝트를 선택하세요"}
                    </h6>
                </div>

                {selectedProjectName ? (
                    <div className="row g-0 flex-grow-1 overflow-hidden">
                        {/* 투입 멤버 리스트 */}
                        <div className="col-md-6 border-end h-100 d-flex flex-column bg-white">
                            <div className="p-2 border-bottom fw-bold small bg-light text-center">투입 멤버</div>
                            <div className="flex-grow-1 overflow-auto">
                                {getMembersInProject().map(m => (
                                    <div key={m.assignmentId} className="border-bottom p-3">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div>
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <span className="fw-bold">{m.empName}</span>
                                                    {m.empRole === 'LEADER' && <span className="badge bg-dark" style={{fontSize: '0.6rem'}}>팀장</span>}
                                                    {getStatusBadge(m.status)}
                                                </div>
                                                <div className="text-muted" style={{fontSize: '0.75rem'}}>
                                                    <i className="bi bi-calendar3 me-1"></i>
                                                    {m.startDate} ~ {' '}
                                                    {m.endDate ? m.endDate : (
                                                        <span className={m.status === '진행중' ? 'text-success fw-bold' : 'text-primary'}>
                                                            {m.status === '진행중' ? '진행 중' : '기한 미정'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="d-flex gap-1">
                                                <button onClick={() => { setEditingId(m.assignmentId); setEditForm({...m, endDate: m.endDate || ""}); }} className="btn btn-xs btn-outline-primary">수정</button>
                                                <button onClick={() => handleDelete(m.assignmentId)} className="btn btn-xs btn-outline-danger">제거</button>
                                            </div>
                                        </div>
                                        {editingId === m.assignmentId && (
                                            <div className="mt-2 p-2 bg-light rounded border">
                                                <div className="row g-1 mb-2">
                                                    <div className="col-6"><label className="x-small text-muted">시작일</label><input type="date" className="form-control form-control-sm" value={editForm.startDate} onChange={e=>setEditForm({...editForm, startDate:e.target.value})} /></div>
                                                    <div className="col-6"><label className="x-small text-muted">종료일</label><input type="date" className="form-control form-control-sm" value={editForm.endDate || ""} onChange={e=>setEditForm({...editForm, endDate:e.target.value})} /></div>
                                                </div>
                                                <div className="d-flex gap-1">
                                                    <button className="btn btn-xs btn-success flex-grow-1" onClick={handleUpdate}>저장</button>
                                                    <button className="btn btn-xs btn-light border flex-grow-1" onClick={()=>setEditingId(null)}>취소</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 가용 인원 리스트 (버튼 탭 UI + 팀장 배지 적용) */}
                        <div className="col-md-6 h-100 d-flex flex-column" style={{backgroundColor: "#FFFDEF"}}>
                            <div className="p-2 border-bottom bg-white d-flex justify-content-between align-items-center">
                                <span className="fw-bold small">배정 가능 인원</span>
                                <div className="btn-group btn-group-sm shadow-sm" style={{ height: '28px' }}>
                                    {["ALL", "LEADER", "EMP"].map(role => (
                                        <button
                                            key={role}
                                            className={`btn btn-xs px-3 ${roleFilter === role ? 'btn-dark' : 'btn-outline-dark'}`}
                                            onClick={() => setRoleFilter(role)}
                                            style={{ fontSize: '0.65rem', fontWeight: 'bold' }}
                                        >
                                            {role === "ALL" ? "전체" : role === "LEADER" ? "팀장" : "사원"}
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
                                                    {e.empName}
                                                    {/* 가용 인원 쪽 팀장 배지 적용 완료 */}
                                                    {e.empRole === 'LEADER' && (
                                                        <span className="badge bg-dark" style={{ fontSize: '0.6rem', padding: '2px 5px' }}>팀장</span>
                                                    )}
                                                </div>
                                                <div className="text-muted" style={{ fontSize: '0.7rem' }}>{e.empId} | {e.empRole}</div>
                                            </div>
                                            <button
                                                onClick={() => handleAssign(e)}
                                                className="btn btn-sm btn-primary py-0 px-3 shadow-sm"
                                                style={{ borderRadius: '20px', fontSize: '0.75rem', height: '24px' }}
                                            >
                                                배정
                                            </button>
                                        </div>
                                    ))}
                                {availableEmps.filter(e => roleFilter === "ALL" || e.empRole === roleFilter).length === 0 && (
                                    <div className="text-center py-5 text-muted small">해당 직급의 가용 인원이 없습니다.</div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-muted">
                        <i className="bi bi-folder2-open mb-2" style={{fontSize: '2rem'}}></i>
                        <p>프로젝트를 선택해 주세요.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OutsourcingAssignmentManager;