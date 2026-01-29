import { useState } from "react";
import axios from "axios";
import "../styles/phaseAiModal.css"
const PhaseAIModal = ({
                          phaseName,
                          sequence,
                          methodology,
                          projectName,
                          onClose,
                          onApply
                      }) => {
    const [mode, setMode] = useState("description"); // description | goal
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState("");

    const handleGenerate = async () => {
        setLoading(true);
        setResult("");

        try {
            const res = await axios.post("/ai/phase/ai-description", {
                phaseName,
                methodology,
                projectName,
                type: mode
            });

            setResult(res.data.description);
        } catch (e) {
            alert("AI 생성 실패");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="project-modal-overlay">
            <div className="project-modal ai">
                <h3 className="modal-title">AI 단계 도우미</h3>

                {/* 탭 */}
                <div className="ai-tab">
                    <button
                        className={mode === "description" ? "active" : ""}
                        onClick={() => setMode("description")}
                    >
                        단계 설명
                    </button>
                    <button
                        className={mode === "goal" ? "active" : ""}
                        onClick={() => setMode("goal")}
                    >
                        단계 목표
                    </button>
                </div>

                {/* 설명 */}
                <div className="ai-guide">
                    {mode === "description" ? (
                        <p>
                            소프트웨어 개발 <b>{methodology}</b> 기법 관점에서<br />
                            <b>{phaseName}</b> 단계의 의미와 역할을 설명합니다.
                        </p>
                    ) : (
                        <p>
                            <b>{projectName}</b> 프로젝트에서<br />
                            <b>{phaseName}</b> 단계의 실무 목표를 생성합니다.
                        </p>
                    )}
                </div>

                <button
                    className="btn-text"
                    onClick={handleGenerate}
                    disabled={loading}
                >
                    {loading ? "AI 생성중..." : "AI 생성"}
                </button>

                <textarea
                    rows={6}
                    value={result}
                    readOnly
                    placeholder="AI 결과가 여기에 표시됩니다."
                />

                <div className="modal-btn-group">
                    <button
                        className="btn-text"
                        disabled={!result}
                        onClick={() => onApply(result)}
                    >
                        적용
                    </button>
                    <button className="btn-text muted" onClick={onClose}>
                        취소
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PhaseAIModal;
