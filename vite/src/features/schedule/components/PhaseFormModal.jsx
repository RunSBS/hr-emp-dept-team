import { useState } from "react";
import axios from "axios";
import PhaseAIModal from "./PhaseAIModal";

const WATERFALL_PHASES = [
    { name: "요구사항분석", sequence: 1 },
    { name: "설계", sequence: 2 },
    { name: "구현", sequence: 3 },
    { name: "테스트", sequence: 4 },
    { name: "유지보수", sequence: 5 },
];

const PhaseFormModal = ({
                            mode,
                            phase,
                            projectId,
                            projectName,
                            projectMethodology,
                            onClose,
                            onSave
                        }) => {
    const isEdit = mode === "edit";
    const isWaterfall = projectMethodology === "폭포수";
    const [showAIModal, setShowAIModal] = useState(false);

    const defaultWaterfallPhase =
        isWaterfall
            ? WATERFALL_PHASES.find(p => p.sequence === 1)
            : null;

    const [form, setForm] = useState(
        isEdit
            ? { ...phase }
            : {
                name: isWaterfall ? defaultWaterfallPhase.name : "",
                description: "",
                sequence: 1,
                startDate: "",
                endDate: "",
                status: "",
            }
    );

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (isWaterfall && name === "sequence") {
            const selected = WATERFALL_PHASES.find(
                (p) => p.sequence === Number(value)
            );
            setForm((prev) => ({
                ...prev,
                sequence: selected.sequence,
                name: selected.name,
            }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    /** ✅ AI 버튼 클릭 검증 로직 */
    const handleOpenAI = () => {
        // 1️⃣ 단계 이름 필수
        if (!form.name || !form.name.trim()) {
            alert("단계 이름을 먼저 입력하세요.");
            return;
        }

        // 2️⃣ 폭포수 모델일 경우 키워드 포함 필수
        if (isWaterfall) {
            const selectedPhase = WATERFALL_PHASES.find(
                (p) => p.sequence === Number(form.sequence)
            );

            if (
                selectedPhase &&
                !form.name.includes(selectedPhase.name)
            ) {
                alert(
                    `폭포수 모델에서는 단계 이름에 '${selectedPhase.name}' 키워드가 포함되어야 합니다.`
                );
                return;
            }
        }

        // 통과 시 AI 모달 오픈
        setShowAIModal(true);
    };

    const handleSave = async () => {
        try {
            if (isEdit) {
                await axios.put(`/back/project-phases/${form.id}`, form);
            } else {
                await axios.post(`/back/project-phases/${projectId}`, form);
            }
            onSave();
            onClose();
        } catch (err) {
            console.error(err);
            alert(isEdit ? "단계 수정 실패" : "단계 추가 실패");
        }
    };

    return (
        <div className="project-modal-overlay">
            <div className="project-modal edit">
                <h3 className="modal-title">
                    {isEdit ? "단계 수정" : "단계 추가"}
                    <button
                        type="button"
                        className="btn-text btn-ai"
                        onClick={handleOpenAI}
                    >
                        AI
                    </button>
                </h3>

                <div className="form-block">
                    {isWaterfall ? (
                        <>
                            <label>단계 선택</label>
                            <select
                                name="sequence"
                                value={form.sequence}
                                onChange={handleChange}
                            >
                                {WATERFALL_PHASES.map((p) => (
                                    <option
                                        key={p.sequence}
                                        value={p.sequence}
                                    >
                                        {p.name}
                                    </option>
                                ))}
                            </select>

                            <label>이름</label>
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                            />
                        </>
                    ) : (
                        <>
                            <label>순서</label>
                            <input
                                type="number"
                                name="sequence"
                                value={form.sequence}
                                onChange={handleChange}
                            />
                            <label>이름</label>
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                            />
                        </>
                    )}

                    <label>목표</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={4}
                    />

                    <label>시작일</label>
                    <input
                        type="datetime-local"
                        name="startDate"
                        value={form.startDate || ""}
                        onChange={handleChange}
                    />

                    <label>종료일</label>
                    <input
                        type="datetime-local"
                        name="endDate"
                        value={form.endDate || ""}
                        onChange={handleChange}
                    />

                    <label>상태</label>
                    <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                    >
                        <option value="">선택</option>
                        <option value="시작안함">시작안함</option>
                        <option value="진행중">진행중</option>
                        <option value="완료">완료</option>
                    </select>
                </div>

                <div className="modal-btn-group">
                    <button className="btn-text" onClick={handleSave}>
                        {isEdit ? "저장" : "추가"}
                    </button>
                    <button
                        className="btn-text muted"
                        onClick={onClose}
                    >
                        취소
                    </button>
                </div>
            </div>

            {showAIModal && (
                <PhaseAIModal
                    phaseName={form.name}
                    sequence={form.sequence}
                    methodology={projectMethodology}
                    projectName={projectName}
                    onClose={() => setShowAIModal(false)}
                    onApply={(aiText) => {
                        setForm((prev) => ({
                            ...prev,
                            description: aiText,
                        }));
                        setShowAIModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default PhaseFormModal;
