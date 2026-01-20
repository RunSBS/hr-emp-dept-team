import { useEffect, useState } from "react";
import axios from "axios";

const OutsourcingCompanyManager = () => {
    const [companies, setCompanies] = useState([]);
    const [selected, setSelected] = useState(null);
    const [history, setHistory] = useState([]); // 이력 데이터
    const [activeTab, setActiveTab] = useState("info"); // info 또는 history 탭 상태

    const fetchCompanies = async () => {
        try {
            const res = await axios.get("/back/hyun/outsourcing/selectAllCompany", { withCredentials: true });
            setCompanies(res.data);
        } catch (e) { console.error("업체 로딩 실패", e); }
    };

    const fetchHistory = async (companyId) => {
        try {
            const res = await axios.get(`/back/hyun/outsourcing/selectCompanyHistory?companyId=${companyId}`, { withCredentials: true });
            setHistory(res.data);
        } catch (e) { console.error("이력 로딩 실패", e); }
    };

    useEffect(() => { fetchCompanies(); }, []);

    const handleSelectCompany = (c) => {
        setSelected({ ...c, isNew: false });
        setActiveTab("info");
        fetchHistory(c.companyId);
    };

    const handleSave = async () => {
        if (!selected.companyName) return alert("업체명을 입력해주세요.");
        const isNew = selected.isNew;
        const url = isNew ? "insertCompany" : "updateCompany";

        try {
            await axios({
                method: isNew ? "post" : "put",
                url: `/back/hyun/outsourcing/${url}`,
                data: { companyId: selected.companyId, companyName: selected.companyName },
                withCredentials: true
            });
            alert("저장되었습니다.");
            if (!isNew) fetchHistory(selected.companyId);
            setSelected(null);
            fetchCompanies();
        } catch (e) { alert("저장 중 오류 발생"); }
    };

    return (
        <div className="row g-4">
            {/* 왼쪽 리스트 영역 */}
            <div className="col-md-4 border-end">
                <button onClick={() => { setSelected({ isNew: true, companyName: "" }); setActiveTab("info"); }}
                        className="btn btn-primary w-100 mb-3 fw-bold shadow-sm py-2">
                    <i className="bi bi-plus-lg me-2"></i>신규 업체 등록
                </button>
                <div className="list-group shadow-sm overflow-auto" style={{ maxHeight: "650px" }}>
                    {companies.map(c => (
                        <button key={c.companyId} onClick={() => handleSelectCompany(c)}
                                className={`list-group-item list-group-item-action py-3 border-start-0 border-end-0 ${selected?.companyId === c.companyId ? 'active shadow-inset' : ''}`}>
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="fw-bold">{c.companyName}</span>
                                <i className="bi bi-chevron-right small opacity-50"></i>
                            </div>
                            <small className={selected?.companyId === c.companyId ? 'text-white-50' : 'text-muted'}>ID: {c.companyId}</small>
                        </button>
                    ))}
                </div>
            </div>

            {/* 오른쪽 상세/이력 영역 */}
            <div className="col-md-8 text-center">
                {selected ? (
                    <div className="card shadow-sm border-0 bg-white text-start">
                        {/* 탭 메뉴 - 버튼 스타일로 강조 */}
                        <div className="card-header bg-white p-3 border-bottom">
                            <div className="btn-group w-100 shadow-sm" role="group">
                                <button type="button"
                                        className={`btn py-2 fw-bold ${activeTab === "info" ? "btn-primary" : "btn-outline-primary"}`}
                                        onClick={() => setActiveTab("info")}>
                                    <i className="bi bi-info-circle me-2"></i>업체 정보 수정
                                </button>
                                {!selected.isNew && (
                                    <button type="button"
                                            className={`btn py-2 fw-bold ${activeTab === "history" ? "btn-info text-white" : "btn-outline-info"}`}
                                            onClick={() => setActiveTab("history")}>
                                        <i className="bi bi-clock-history me-2"></i>변경 이력 확인
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="card-body p-4 bg-light" style={{ minHeight: "400px" }}>
                            {activeTab === "info" ? (
                                <div className="animate__animated animate__fadeIn">
                                    <h5 className="fw-bold mb-4 text-dark border-bottom pb-2">
                                        {selected.isNew ? "신규 등록" : "정보 관리"}
                                    </h5>
                                    <div className="mb-4 bg-white p-4 rounded border shadow-sm">
                                        <label className="form-label small fw-bold text-secondary">협력 업체명</label>
                                        <input className="form-control form-control-lg border-primary-subtle bg-light-subtle"
                                               value={selected.companyName}
                                               placeholder="업체 이름을 입력하세요"
                                               onChange={(e) => setSelected({...selected, companyName: e.target.value})} />
                                        <div className="form-text mt-2">등록된 업체명은 프로젝트 배정 시 사용됩니다.</div>
                                    </div>
                                    <button onClick={handleSave} className="btn btn-success w-100 fw-bold py-3 shadow">
                                        <i className="bi bi-check-circle me-2"></i>업체 정보 저장하기
                                    </button>
                                </div>
                            ) : (
                                <div className="animate__animated animate__fadeIn">
                                    <h5 className="fw-bold mb-4 text-dark border-bottom pb-2">시스템 로그 (변경 이력)</h5>
                                    <div className="table-responsive rounded shadow-sm bg-white">
                                        <table className="table table-hover mb-0">
                                            <thead className="table-dark">
                                            <tr className="small">
                                                <th className="py-3 ps-3">변경 일시</th>
                                                <th className="py-3">항목</th>
                                                <th className="py-3 text-center">변경 내용 (이전 → 이후)</th>
                                                <th className="py-3">담당자</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {history.length > 0 ? history.map(h => (
                                                <tr key={h.companyHistoryId} className="align-middle">
                                                    <td className="ps-3 small text-muted">
                                                        {new Date(h.createdAt).toLocaleString()}
                                                    </td>
                                                    <td><span className="badge bg-secondary bg-opacity-10 text-secondary border">{h.fieldName}</span></td>
                                                    <td>
                                                        <div className="d-flex align-items-center justify-content-center gap-2 small">
                                                            <span className="text-muted text-decoration-line-through">{h.beforeValue || "없음"}</span>
                                                            <i className="bi bi-arrow-right text-info fw-bold"></i>
                                                            <span className="text-primary fw-bold">{h.afterValue}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                            <span className="badge rounded-pill bg-light text-dark border fw-normal">
                                                                <i className="bi bi-person me-1"></i>{h.changerName}
                                                            </span>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="4" className="text-center py-5 text-muted">
                                                        <i className="bi bi-exclamation-circle d-block fs-2 mb-2"></i>
                                                        기록된 변경 이력이 없습니다.
                                                    </td>
                                                </tr>
                                            )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted border border-dashed rounded bg-white py-5 shadow-sm" style={{ minHeight: "500px" }}>
                        <i className="bi bi-building-up mb-3 opacity-25" style={{ fontSize: "5rem" }}></i>
                        <h5 className="fw-bold">업체 정보 관리</h5>
                        <p>좌측 리스트에서 업체를 선택하거나 새 업체를 등록해 주세요.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OutsourcingCompanyManager;