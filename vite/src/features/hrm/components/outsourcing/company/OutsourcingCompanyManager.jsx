import { useEffect, useState } from "react";
import axios from "axios";

const OutsourcingCompanyManager = () => {
    const [companies, setCompanies] = useState([]);
    const [selected, setSelected] = useState(null);

    // 1. 업체 목록 로드
    const fetchCompanies = async () => {
        try {
            const res = await axios.get("/back/hyun/outsourcing/selectAllCompany", { withCredentials: true });
            setCompanies(res.data);
        } catch (e) {
            console.error("업체 로딩 실패", e);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    // 2. 입력값 변경 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setSelected(prev => ({ ...prev, [name]: value }));
    };

    // 3. 저장 (등록/수정) 핸들러
    const handleSave = async () => {
        if (!selected.companyName) {
            alert("업체명을 입력해주세요.");
            return;
        }

        const isNew = selected.isNew;
        const url = isNew ? "insertCompany" : "updateCompany";

        try {
            await axios({
                method: isNew ? "post" : "put",
                url: `/back/hyun/outsourcing/${url}`,
                data: selected,
                withCredentials: true
            });
            alert(isNew ? "업체가 등록되었습니다." : "업체 정보가 수정되었습니다.");
            setSelected(null);
            fetchCompanies();
        } catch (e) {
            console.error("저장 실패", e);
            alert("저장 중 오류가 발생했습니다.");
        }
    };

    // 4. 삭제 핸들러
    const handleDelete = async (name) => {
        if (!window.confirm(`[${name}] 업체를 삭제하시겠습니까?\n해당 업체에 배정된 사원 데이터가 있을 경우 삭제가 불가능할 수 있습니다.`)) return;

        try {
            await axios.delete("/back/hyun/outsourcing/deleteCompany", {
                data: { companyName: name },
                withCredentials: true
            });
            alert("삭제되었습니다.");
            setSelected(null);
            fetchCompanies();
        } catch (e) {
            alert("삭제 실패: 배정된 사원 데이터를 먼저 확인하세요.");
        }
    };

    return (
        <div style={{ display: "flex", gap: "20px" }}>
            {/* 왼쪽: 업체 목록 리스트 */}
            <div style={{ width: "350px", borderRight: "1px solid #eee", paddingRight: "20px" }}>
                <button
                    onClick={() => setSelected({ isNew: true, companyName: "" })}
                    style={{
                        width: "100%", padding: "12px", marginBottom: "20px",
                        backgroundColor: "#f8f9fa", border: "1px dashed #ccc", cursor: "pointer"
                    }}
                >
                    + 새 업체 등록
                </button>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "600px", overflowY: "auto" }}>
                    {companies.map(c => (
                        <div
                            key={c.companyId}
                            onClick={() => setSelected({ ...c, isNew: false })}
                            style={{
                                padding: "15px", border: "1px solid #eee", borderRadius: "8px", cursor: "pointer",
                                transition: "all 0.2s",
                                backgroundColor: selected?.companyId === c.companyId ? "#e7f3ff" : "#fff",
                                borderColor: selected?.companyId === c.companyId ? "#007bff" : "#eee"
                            }}
                        >
                            <div style={{ fontWeight: "bold", fontSize: "16px" }}>{c.companyName}</div>
                            <div style={{ fontSize: "12px", color: "#999", marginTop: "5px" }}>
                                ID: {c.companyId} | 등록일: {c.createdAt?.split('T')[0]}
                            </div>
                        </div>
                    ))}
                    {companies.length === 0 && <p style={{ textAlign: "center", color: "#999" }}>등록된 업체가 없습니다.</p>}
                </div>
            </div>

            {/* 오른쪽: 상세 정보 및 편집 폼 */}
            <div style={{ flex: 1, padding: "20px", backgroundColor: "#fcfcfc", borderRadius: "8px" }}>
                {selected ? (
                    <div style={{ maxWidth: "500px" }}>
                        <h3>{selected.isNew ? "✨ 새 파견업체 등록" : "🏢 업체 정보 수정"}</h3>
                        <hr style={{ margin: "20px 0", border: "0.5px solid #eee" }} />

                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>업체명</label>
                            <input
                                name="companyName"
                                style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "4px" }}
                                value={selected.companyName}
                                onChange={handleChange}
                                placeholder="업체명을 입력하세요"
                            />
                        </div>

                        {!selected.isNew && (
                            <div style={{ marginBottom: "20px", fontSize: "14px", color: "#666" }}>
                                <p>최초 등록일: {selected.createdAt}</p>
                                <p>최근 수정일: {selected.updatedAt}</p>
                            </div>
                        )}

                        <div style={{ marginTop: "30px", display: "flex", gap: "12px" }}>
                            <button
                                onClick={handleSave}
                                style={{ flex: 2, padding: "12px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                            >
                                {selected.isNew ? "등록하기" : "수정사항 저장"}
                            </button>
                            {!selected.isNew && (
                                <button
                                    onClick={() => handleDelete(selected.companyName)}
                                    style={{ flex: 1, padding: "12px", backgroundColor: "#fff", color: "#dc3545", border: "1px solid #dc3545", borderRadius: "4px", cursor: "pointer" }}
                                >
                                    업체 삭제
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: "center", marginTop: "100px", color: "#999" }}>
                        <div style={{ fontSize: "40px", marginBottom: "20px" }}>🏢</div>
                        <p>좌측 리스트에서 업체를 선택하거나<br/>새로운 업체를 등록해 주세요.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OutsourcingCompanyManager;