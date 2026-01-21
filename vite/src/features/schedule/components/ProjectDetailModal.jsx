import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/projectdetailmodal.css";
import PhaseFormModal from "./PhaseFormModal";
const ProjectDetailModal = ({ projectId, onClose }) => {
    const [project, setProject] = useState(null);
    const [phases, setPhases] = useState([]);
    const [phaseModal, setPhaseModal] = useState(null); // { mode, phase }
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
        if (phases.length > 0) {
            fetchDelivers(phases[currentPhaseIndex].id);
        }
    }, [currentPhaseIndex, phases]);

    if (!project) return null;
    const currentPhase = phases[currentPhaseIndex];

    return (
        <div className="project-modal-overlay">
            <div className="project-modal">
                <div
                    className="project-header"
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <h1>{project.name}</h1>
                        <span className="method">{project.methodology}</span>
                    </div>
                    <button className="btn-text muted" onClick={onClose}>닫기</button>
                </div>

                <button
                    className="btn-text section-right"
                    onClick={() => setPhaseModal({ mode: "add" })}
                >
                    + 단계 추가
                </button>

                {currentPhase && (
                    <>
                        <div className="phase-detail">
                            <div className="section-header">
                                <div className="section-left">
                                    <span className="phase-title">{currentPhase.name}</span>
                                    <span>
                                        {new Date(currentPhase.startDate).toLocaleDateString("ko-KR")} ~
                                        {new Date(currentPhase.endDate).toLocaleDateString("ko-KR")}
                                    </span>
                                    <span className={`phase-status ${
                                        currentPhase.status === "시작안함" ? "not-started" :
                                            currentPhase.status === "진행중" ? "in-progress" :
                                                currentPhase.status === "완료" ? "completed" : ""
                                    }`}>
                                        {currentPhase.status}
                                    </span>
                                </div>
                            </div>

                            <div className="phase-body">
                                <p className="phase-desc">{currentPhase.description}</p>
                                <div className="phase-actions">
                                    <button
                                        className="btn-text"
                                        onClick={() => setPhaseModal({ mode: "edit", phase: currentPhase })}
                                    >
                                        수정
                                    </button>
                                    <button
                                        className="btn-text muted"
                                        onClick={async () => {
                                            if (!window.confirm("단계를 삭제하시겠습니까?")) return;
                                            await axios.delete(`/back/project-phases/${currentPhase.id}`);
                                            fetchPhases();
                                        }}
                                    >
                                        삭제
                                    </button>
                                </div>
                            </div>

                            {/* 산출물 */}
                            <div className="deliver-section">
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <h4>산출물</h4>
                                    <button className="btn-text" onClick={() => setAddingDeliver(true)}>
                                        + 산출물 추가
                                    </button>
                                </div>

                                {delivers.length === 0 && (
                                    <p className="empty-text">등록된 산출물이 없습니다.</p>
                                )}

                                <ul className="deliver-list">
                                    {delivers.map(d => {
                                        const isImage = d.filePath?.match(/\.(jpg|jpeg|png|gif)$/i);
                                        const fullUrl = springBaseUrl + "/" + d.filePath.replace(/\\/g, "/");

                                        return (
                                            <li key={d.id} className="deliver-item">
                                                <span className="deliver-name">{d.name}</span>
                                                <span className="deliver-meta">
                                                    <span className="deliver-desc">{d.description}</span>
                                                    <span className="deliver-date">
                                                        {new Date(d.createdAt).toLocaleString("ko-KR", {
                                                            month: "2-digit",
                                                            day: "2-digit",
                                                            hour: "2-digit",
                                                            minute: "2-digit"
                                                        })}
                                                    </span>

                                                    {isImage && (
                                                        <button
                                                            className="btn-text muted"
                                                            onClick={() => setPreviewImage(fullUrl)}
                                                        >
                                                            미리보기
                                                        </button>
                                                    )}

                                                    <button
                                                        className="btn-text muted"
                                                        onClick={() => {
                                                            const link = document.createElement("a");
                                                            link.href = springBaseUrl + `/phase-delivers/${d.id}/download`;
                                                            link.click();
                                                        }}
                                                    >
                                                        다운로드
                                                    </button>

                                                    <button
                                                        className="btn-text muted"
                                                        onClick={async () => {
                                                            if (!window.confirm("산출물을 삭제하시겠습니까?")) return;
                                                            await axios.delete(`/back/phase-delivers/${d.id}`);
                                                            fetchDelivers(currentPhase.id);
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
                            <button
                                className="btn-text"
                                disabled={currentPhaseIndex === 0}
                                onClick={() => setCurrentPhaseIndex(i => i - 1)}
                            >
                                이전
                            </button>
                            <span>{currentPhaseIndex + 1} / {phases.length}</span>
                            <button
                                className="btn-text"
                                disabled={currentPhaseIndex === phases.length - 1}
                                onClick={() => setCurrentPhaseIndex(i => i + 1)}
                            >
                                다음
                            </button>
                        </div>
                    </>
                )}

                {phaseModal && (
                    <PhaseFormModal
                        mode={phaseModal.mode}
                        phase={phaseModal.phase}
                        projectId={projectId}
                        projectName={project.name}
                        projectMethodology={project.methodology}
                        onClose={() => setPhaseModal(null)}
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
   공통 Phase 모달 (Add / Edit)
========================= */



/* =========================
   산출물 추가 모달 (그대로 유지)
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
        formData.append("name", deliverFile.name);
        formData.append("description", description);
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

export default ProjectDetailModal;
