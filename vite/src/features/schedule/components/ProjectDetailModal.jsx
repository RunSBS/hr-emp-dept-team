import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/projectdetailmodal.css";

const ProjectDetailModal = ({ projectId, onClose}) => {
    const [project, setProject] = useState(null);
    const [phases, setPhases] = useState([]);
    const [editingPhase, setEditingPhase] = useState(null);
    const [addingPhase, setAddingPhase] = useState(false);
    const [addingDeliver, setAddingDeliver] = useState(false);
    const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
    const [previewImage, setPreviewImage] = useState(null);

    const [delivers, setDelivers] = useState([]);

    const springBaseUrl = "http://localhost:8080";

    const fetchPhases = async () => {
        try {
            const res = await axios.get(`/back/project-phases/project/${projectId}`);
            setPhases(res.data.sort((a, b) => a.sequence - b.sequence));
            setCurrentPhaseIndex(0);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchDelivers = async (phaseId) => {
        try {
            const res = await axios.get(`/back/phase-delivers/phase/${phaseId}`);
            setDelivers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (!projectId) return;
        axios.get(`/back/project/${projectId}`).then(res => setProject(res.data));
        fetchPhases();
    }, [projectId]);

    useEffect(() => {
        if (phases.length > 0) fetchDelivers(phases[currentPhaseIndex].id);
    }, [currentPhaseIndex, phases]);

    if (!project) return null;
    const currentPhase = phases[currentPhaseIndex];

    return (
        <div className="project-modal-overlay">
            <div className="project-modal">
                <div className="project-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <h1>{project.name}</h1>
                        <span className="method">{project.methodology}</span>
                    </div>
                    <button className="btn-text muted" onClick={onClose}>닫기</button>
                </div>
                <button className="btn-text section-right" onClick={() => setAddingPhase(true)}>+ 단계 추가</button>
                {currentPhase && (
                    <>
                        <div className="phase-detail">
                            <div className="section-header">
                                <div className="section-left">
                                    <span className="phase-title">{currentPhase.name}</span>
                                    <span>
                                        {new Date(currentPhase.startDate).toLocaleDateString('ko-KR')} ~
                                        {new Date(currentPhase.endDate).toLocaleDateString('ko-KR')}
                                    </span>
                                    <span
                                        className={`phase-status ${
                                            currentPhase.status === "시작안함"
                                                ? "not-started"
                                                : currentPhase.status === "진행중"
                                                    ? "in-progress"
                                                    : currentPhase.status === "완료"
                                                        ? "completed"
                                                        : ""
                                        }`}
                                    >
                                      {currentPhase.status}
                                    </span>
                                </div>
                            </div>
                            <div className="phase-body">
                                <p className="phase-desc">{currentPhase.description}</p>

                                <div className="phase-actions">
                                    <button className="btn-text" onClick={() => setEditingPhase(currentPhase)}>수정</button>
                                    <button className="btn-text muted"
                                            onClick={async () => {
                                                if (!window.confirm("단계를 삭제하시겠습니까?")) return;
                                                try {
                                                    await axios.delete(`/back/project-phases/${currentPhase.id}`);
                                                    fetchPhases();
                                                } catch (err) {
                                                    console.error(err);
                                                    alert("삭제 실패");
                                                }
                                            }}
                                    >삭제</button>
                                </div>
                            </div>
                                <div className="deliver-section">
                                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                                        <h4>산출물</h4>
                                        <button className="btn-text" onClick={() => setAddingDeliver(true)}>+ 산출물 추가</button>
                                    </div>
                                    {delivers.length === 0 && <p className="empty-text">등록된 산출물이 없습니다.</p>}

                                    <ul className="deliver-list">
                                        {delivers.map(d => {
                                            // 이미지인지 체크
                                            const isImage = d.filePath?.match(/\.(jpg|jpeg|png|gif)$/i);

                                            // full URL 생성: 서버 Base URL + 파일 경로
                                            const fullUrl = springBaseUrl + "/" + d.filePath.replace(/\\/g, "/"); // 윈도우 경로도 슬래시로 변환

                                            return (
                                                <li key={d.id} className="deliver-item">
                                                    <span className="deliver-name">{d.name}</span>
                                                    <span className="deliver-meta">
                                                    <span className="deliver-desc">{d.description}</span>
                                                    <span className="deliver-date">
                                                        {new Date(d.createdAt).toLocaleString('ko-KR', {
                                                            month: '2-digit',
                                                            day: '2-digit',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>

                                                        {/* 이미지 미리보기 버튼 */}
                                                        {isImage && (
                                                            <button
                                                                className="btn-text muted"
                                                                onClick={() => setPreviewImage(fullUrl)}>
                                                                미리보기
                                                            </button>
                                                        )}

                                                        {/* 다운로드 버튼 */}
                                                        <button
                                                            className="btn-text muted"
                                                            onClick={() => {
                                                                const link = document.createElement("a");
                                                                link.href = springBaseUrl + `/phase-delivers/${d.id}/download`;
                                                                document.body.appendChild(link);
                                                                link.click();
                                                                document.body.removeChild(link);
                                                            }}
                                                        >
                                                            다운로드
                                                        </button>

                                                        {/* 삭제 버튼 */}
                                                        <button
                                                            className="btn-text muted"
                                                            onClick={async () => {
                                                                if (!window.confirm("산출물을 삭제하시겠습니까?")) return;
                                                                try {
                                                                    await axios.delete(`/back/phase-delivers/${d.id}`);
                                                                    fetchDelivers(currentPhase.id);
                                                                } catch (err) {
                                                                    console.error(err);
                                                                    alert("삭제 실패");
                                                                }
                                                            }}
                                                            >
                                                            삭제
                                                        </button>
                                                    </span>
                                                </li>
                                            );
                                        })}

                                    </ul>
                                </div>
                        </div>
                        <div className="phase-navigation">
                            <button className="btn-text" disabled={currentPhaseIndex === 0}
                                    onClick={() => setCurrentPhaseIndex(i => i - 1)}>이전</button>
                            <span>{currentPhaseIndex + 1} / {phases.length}</span>
                            <button className="btn-text" disabled={currentPhaseIndex === phases.length - 1}
                                    onClick={() => setCurrentPhaseIndex(i => i + 1)}>다음</button>
                        </div>
                    </>
                )}


                {editingPhase && (
                    <EditPhaseModal
                        phase={editingPhase}
                        projectMethodology={project.methodology}
                        onClose={() => setEditingPhase(null)}
                        onSave={fetchPhases}
                    />
                )}

                {addingPhase && (
                    <AddPhaseModal
                        projectId={projectId}
                        projectMethodology={project.methodology}
                        onClose={() => setAddingPhase(false)}
                        onSave={fetchPhases}
                    />
                )}

                {addingDeliver && currentPhase && (
                    <AddDeliverModal
                        phaseId={currentPhase.id}
                        onClose={() => setAddingDeliver(false)}
                        onSave={() => fetchDelivers(currentPhase.id)}
                    />
                )}
                {previewImage && (
                    <div className="image-preview-overlay" onClick={() => setPreviewImage(null)}>
                        <div className="image-preview-modal" onClick={e => e.stopPropagation()}>
                            <img src={previewImage} alt="미리보기" />
                            <button className="close-btn" onClick={() => setPreviewImage(null)}>x</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

/* =========================
   단계 수정 모달
========================= */
const WATERFALL_PHASES = [
    { name: "요구사항분석", sequence: 1 },
    { name: "설계", sequence: 2 },
    { name: "구현", sequence: 3 },
    { name: "테스트", sequence: 4 },
    { name: "유지보수", sequence: 5 },
];
const EditPhaseModal = ({ phase, projectMethodology, onClose, onSave }) => {
    const [form, setForm] = useState({ ...phase });
    const isWaterfall = projectMethodology === "폭포수";

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (isWaterfall && name === "sequence") {
            const selected = WATERFALL_PHASES.find(p => p.sequence === Number(value));
            setForm(prev => ({ ...prev, sequence: selected.sequence, name: selected.name }));
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = async () => {
        try {
            await axios.put(`/back/project-phases/${form.id}`, form);
            onSave();
            onClose();
        } catch (err) {
            console.error(err);
            alert("단계 수정 실패");
        }
    };

    return (
        <div className="project-modal-overlay">
            <div className="project-modal edit">
                <h3 className="modal-title">단계 수정</h3>

                <div className="form-block">
                    {isWaterfall ? (
                        <>
                            <label>단계 선택</label>
                            <select name="sequence" value={form.sequence} onChange={handleChange}>
                                {WATERFALL_PHASES.map(p => (
                                    <option key={p.sequence} value={p.sequence}>{p.name}</option>
                                ))}
                            </select>
                            <label>이름</label>
                            <input name="name" value={form.name} onChange={handleChange} />
                        </>
                    ) : (
                        <>
                            <label>순서</label>
                            <input type="number" name="sequence" value={form.sequence} onChange={handleChange} />
                            <label>이름</label>
                            <input name="name" value={form.name} onChange={handleChange} />
                        </>
                    )}

                    <label>설명</label>
                    <textarea name="description" value={form.description} onChange={handleChange} rows={4} />
                    <label>시작일</label>
                    <input type="datetime-local" name="startDate" value={form.startDate || ""} onChange={handleChange} />
                    <label>종료일</label>
                    <input type="datetime-local" name="endDate" value={form.endDate || ""} onChange={handleChange} />
                    <label>상태</label>
                    <select name="status" value={form.status} onChange={handleChange}>
                        <option value="">선택</option>
                        <option value="시작안함">시작안함</option>
                        <option value="진행중">진행중</option>
                        <option value="완료">완료</option>
                    </select>
                </div>

                <div className="modal-btn-group">
                    <button className="btn-text" onClick={handleSave}>저장</button>
                    <button className="btn-text muted" onClick={onClose}>취소</button>
                </div>
            </div>
        </div>
    );
};

/* =========================
   단계 추가 모달
========================= */
const AddPhaseModal = ({ projectId, projectMethodology, onClose, onSave }) => {
    const [form, setForm] = useState({
        name: "",
        description: "",
        sequence: 1,
        startDate: "",
        endDate: "",
        status: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            await axios.post(`/back/project-phases/${projectId}`, form);
            onSave();
            onClose();
        } catch (err) {
            console.error(err);
            alert("단계 추가 실패");
        }
    };

    const isWaterfall = projectMethodology === "폭포수";

    return (
        <div className="project-modal-overlay">
            <div className="project-modal edit">
                <h3 className="modal-title">단계 추가</h3>

                <div className="form-block">
                    {isWaterfall ? (
                        <>
                            <label>단계 선택</label>
                            <select
                                name="sequence"
                                value={form.sequence}
                                onChange={(e) => {
                                    const selected = WATERFALL_PHASES.find(p => p.sequence === Number(e.target.value));
                                    setForm(prev => ({
                                        ...prev,
                                        sequence: selected.sequence,
                                        name: selected.name
                                    }));
                                }}
                            >
                                {WATERFALL_PHASES.map(p => (
                                    <option key={p.sequence} value={p.sequence}>{p.name}</option>
                                ))}
                            </select>
                            <label>이름</label>
                            <input name="name" value={form.name} onChange={handleChange} />
                        </>
                    ) : (
                        <>
                            <label>순서</label>
                            <input type="number" name="sequence" value={form.sequence} onChange={handleChange} />
                            <label>이름</label>
                            <input name="name" value={form.name} onChange={handleChange} />
                        </>
                    )}

                    <label>설명</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={4}
                        placeholder="단계 설명을 입력하세요"
                    />
                    <label>시작일</label>
                    <input type="datetime-local" name="startDate" value={form.startDate} onChange={handleChange} />
                    <label>종료일</label>
                    <input type="datetime-local" name="endDate" value={form.endDate} onChange={handleChange} />
                    <label>상태</label>
                    <select name="status" value={form.status} onChange={handleChange}>
                        <option value="">선택</option>
                        <option value="시작안함">시작안함</option>
                        <option value="진행중">진행중</option>
                        <option value="완료">완료</option>
                    </select>

                </div>

                <div className="modal-btn-group">
                    <button className="btn-text" onClick={handleSave}>추가</button>
                    <button className="btn-text muted" onClick={onClose}>취소</button>
                </div>
            </div>
        </div>
    );
};


/* =========================
   산출물 추가 모달 (파일명 자동 + 설명 입력)
========================= */
const AddDeliverModal = ({ phaseId, onClose, onSave }) => {
    const [deliverFile, setDeliverFile] = useState(null);
    const [description, setDescription] = useState("");

    const handleUpload = async () => {
        if (!deliverFile) {
            alert("파일을 선택하세요");
            return;
        }

        const formData = new FormData();
        formData.append("phaseId", phaseId);
        formData.append("name", deliverFile.name); // 파일명 그대로 저장
        formData.append("description", description); // 입력받은 설명
        formData.append("file", deliverFile);

        try {
            await axios.post("/back/phase-delivers/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            onSave();
            onClose();
        } catch (err) {
            console.error(err);
            alert("산출물 업로드 실패");
        }
    };

    return (
        <div className="project-modal-overlay">
            <div className="project-modal edit add-deliver">
                <h3 className="modal-title">산출물 추가</h3>
                <div className="form-block">
                    <label>파일</label>
                    <input type="file" onChange={e => setDeliverFile(e.target.files[0])} />

                    <label>설명</label>
                    <input
                        type="text"
                        placeholder="산출물 설명을 입력하세요"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                </div>

                <div className="modal-btn-group">
                    <button className="btn-text" onClick={handleUpload}>업로드</button>
                    <button className="btn-text muted" onClick={onClose}>취소</button>
                </div>
            </div>
        </div>
    );
};

/* =========================
   프로젝트 상세 모달
========================= */
export default ProjectDetailModal;
