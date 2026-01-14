import { useEffect, useState } from "react";
import axios from "axios";

const OutsourcingAssignmentManager = () => {
    const [assignments, setAssignments] = useState([]); // 전체 배치 데이터
    const [emps, setEmps] = useState([]);               // 사원 선택용 리스트
    const [companies, setCompanies] = useState([]);       // 업체 선택용 리스트
    const [selected, setSelected] = useState(null);       // 선택된 상세 데이터

    // 초기 데이터 로드
    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [assignRes, empRes, compRes] = await Promise.all([
                axios.get("/back/hyun/outsourcing/selectAllAssignment", { withCredentials: true }),
                axios.get("/back/hyun/emp/selectAll", { withCredentials: true }),
                axios.get("/back/hyun/outsourcing/selectAllCompany", { withCredentials: true })
            ]);
            setAssignments(assignRes.data);
            setEmps(empRes.data);
            setCompanies(compRes.data);
        } catch (e) {
            console.error("데이터 로딩 실패", e);
        }
    };

    // UI 그룹화 로직: projectName을 Key로 사용하여 객체 생성
    const getGroupedProjects = () => {
        return assignments.reduce((acc, curr) => {
            const key = curr.projectName || "미지정 프로젝트";
            if (!acc[key]) acc[key] = [];
            acc[key].push(curr);
            return acc;
        }, {});
    };

    const groupedData = getGroupedProjects();

    const handleSelect = (item) => {
        setSelected({ ...item, isNew: false });
    };

    const handleNew = () => {
        setSelected({
            isNew: true,
            assignmentId: null,
            empId: "",
            companyId: "",
            projectName: "",
            status: "예정",
            startDate: "",
            endDate: ""
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSelected(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        const url = selected.isNew ? "insertAssignment" : "updateAssignment";
        try {
            await axios.post(`/back/hyun/outsourcing/${url}`, selected, { withCredentials: true });
            alert("저장되었습니다.");
            setSelected(null);
            fetchInitialData();
        } catch (e) {
            alert("저장 실패: 입력값을 확인하세요.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("배치 정보를 삭제하시겠습니까?")) return;
        try {
            await axios.delete("/back/hyun/outsourcing/deleteAssignment", {
                data: { assignmentId: id },
                withCredentials: true
            });
            alert("삭제되었습니다.");
            setSelected(null);
            fetchInitialData();
        } catch (e) {
            alert("삭제 실패");
        }
    };

    return (
        <div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
            {/* 왼쪽: 프로젝트별 그룹 리스트 */}
            <div style={{ width: "400px", border: "1px solid #ddd", borderRadius: "8px", padding: "15px", backgroundColor: "#fdfdfd" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h5 style={{ margin: 0 }}>📂 프로젝트별 인원</h5>
                    <button onClick={handleNew} className="btn btn-sm btn-primary">+ 배정 추가</button>
                </div>

                <div style={{ maxHeight: "650px", overflowY: "auto", paddingRight: "5px" }}>
                    {Object.keys(groupedData).length === 0 && <p style={{color: "#999", textAlign: "center"}}>데이터가 없습니다.</p>}

                    {Object.keys(groupedData).map(projectName => (
                        <div key={projectName} style={projectCardStyle}>
                            {/* 프로젝트 헤더 */}
                            <div style={projectHeaderStyle}>
                                <span style={{ fontWeight: "bold" }}>{projectName}</span>
                                <span className="badge bg-primary rounded-pill">{groupedData[projectName].length}명</span>
                            </div>

                            {/* 프로젝트 소속 인원 리스트 */}
                            <div style={{ backgroundColor: "#fff" }}>
                                {groupedData[projectName].map(emp => (
                                    <div
                                        key={emp.assignmentId}
                                        onClick={() => handleSelect(emp)}
                                        style={empItemStyle(selected?.assignmentId === emp.assignmentId)}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span><strong>{emp.empId}</strong> 사원</span>
                                            <span style={{
                                                fontSize: "12px",
                                                color: emp.status === "진행중" ? "#0d6efd" : "#6c757d"
                                            }}>{emp.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 오른쪽: 상세 정보 편집 폼 */}
            <div style={{ flex: 1, border: "1px solid #ddd", borderRadius: "8px", padding: "25px", backgroundColor: "#fff" }}>
                {selected ? (
                    <div>
                        <h4>{selected.isNew ? "✨ 신규 사원 배정" : "📝 배정 상세 수정"}</h4>
                        <hr />
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">대상 사원</label>
                                <select className="form-select" name="empId" value={selected.empId} onChange={handleChange} disabled={!selected.isNew}>
                                    <option value="">사원 선택</option>
                                    {emps.map(e => <option key={e.empId} value={e.empId}>{e.empName} ({e.empId})</option>)}
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">파견 업체</label>
                                <select className="form-select" name="companyId" value={selected.companyId} onChange={handleChange} disabled={!selected.isNew}>
                                    <option value="">업체 선택</option>
                                    {companies.map(c => <option key={c.companyId} value={c.companyId}>{c.companyName}</option>)}
                                </select>
                            </div>
                            <div className="col-12">
                                <label className="form-label">프로젝트명</label>
                                <input className="form-control" name="projectName" value={selected.projectName} onChange={handleChange} placeholder="프로젝트 이름을 입력하세요" />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">진행 상태</label>
                                <select className="form-select" name="status" value={selected.status} onChange={handleChange}>
                                    <option value="예정">예정</option>
                                    <option value="진행중">진행중</option>
                                    <option value="종료">종료</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">파견 시작일</label>
                                <input type="date" className="form-control" name="startDate" value={selected.startDate} onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">철수 예정일</label>
                                <input type="date" className="form-control" name="endDate" value={selected.endDate} onChange={handleChange} />
                            </div>
                        </div>

                        <div style={{ marginTop: "40px", display: "flex", gap: "10px" }}>
                            <button onClick={handleSave} className="btn btn-success px-4">저장</button>
                            {!selected.isNew && (
                                <button onClick={() => handleDelete(selected.assignmentId)} className="btn btn-outline-danger">배정 삭제</button>
                            )}
                            <button onClick={() => setSelected(null)} className="btn btn-light">취소</button>
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: "center", marginTop: "150px", color: "#ccc" }}>
                        <h1 style={{fontSize: "60px"}}>📂</h1>
                        <p>프로젝트를 선택하거나 신규 배정을 등록해 주세요.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// 스타일 상수
const projectCardStyle = {
    marginBottom: "15px",
    border: "1px solid #eee",
    borderRadius: "8px",
    overflow: "hidden"
};

const projectHeaderStyle = {
    backgroundColor: "#f8f9fa",
    padding: "10px 15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #eee"
};

const empItemStyle = (isActive) => ({
    padding: "12px 15px",
    cursor: "pointer",
    borderBottom: "1px solid #f9f9f9",
    backgroundColor: isActive ? "#e7f3ff" : "transparent",
    fontSize: "14px"
});

export default OutsourcingAssignmentManager;