import { useEffect, useState } from "react";
import axios from "axios";

const OutsourcingCompanyManager = () => {
    const [companies, setCompanies] = useState([]);
    const [selected, setSelected] = useState(null);

    const fetchCompanies = async () => {
        try {
            const res = await axios.get("/back/hyun/outsourcing/selectAllCompany", { withCredentials: true });
            setCompanies(res.data);
        } catch (e) { console.error("업체 로딩 실패", e); }
    };

    useEffect(() => { fetchCompanies(); }, []);

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
            setSelected(null);
            fetchCompanies();
        } catch (e) { alert("저장 중 오류 발생"); }
    };

    return (
        <div className="row">
            <div className="col-md-4 border-end">
                <button onClick={() => setSelected({ isNew: true, companyName: "" })} className="btn btn-primary w-100 mb-3 fw-bold">신규 업체 등록</button>
                <div className="list-group shadow-sm overflow-auto" style={{ maxHeight: "600px" }}>
                    {companies.map(c => (
                        <button key={c.companyId} onClick={() => setSelected({ ...c, isNew: false })}
                                className={`list-group-item list-group-item-action py-3 ${selected?.companyId === c.companyId ? 'active' : ''}`}>
                            <div className="fw-bold">{c.companyName}</div>
                            <small className={selected?.companyId === c.companyId ? 'text-white-50' : 'text-muted'}>ID: {c.companyId}</small>
                        </button>
                    ))}
                </div>
            </div>
            <div className="col-md-8 ps-4 text-center mt-5">
                {selected ? (
                    <div className="card p-4 shadow-sm border-0 bg-light text-start">
                        <h5 className="fw-bold mb-4">{selected.isNew ? "신규 업체 등록" : "업체 정보 수정"}</h5>
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-secondary">업체명</label>
                            <input className="form-control form-control-lg" value={selected.companyName}
                                   onChange={(e) => setSelected({...selected, companyName: e.target.value})} />
                        </div>
                        <button onClick={handleSave} className="btn btn-success w-100 fw-bold">업체 저장하기</button>
                    </div>
                ) : <div className="text-muted">업체를 선택하거나 등록하세요.</div>}
            </div>
        </div>
    );
};

export default OutsourcingCompanyManager;