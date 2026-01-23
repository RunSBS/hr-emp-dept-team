import React, { useState, useRef, useEffect } from "react";
import "../styles/chatWidget.css";
import { FaComments, FaTimes, FaPaperPlane } from "react-icons/fa";

export default function ChatWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const chatLogRef = useRef(null);

    useEffect(() => {
        if (chatLogRef.current) {
            chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async (preset) => {
        const msg = (preset ?? input).trim();
        if (!msg) return;

        setMessages(prev => [...prev, { role: "user", text: msg }]);
        setInput("");
        setMessages(prev => [...prev, { role: "bot", thinking: true }]);

        try {
            const resp = await fetch("/ai/chatbot/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: msg })
            });
            const data = await resp.json();

            setMessages(prev => {
                const updated = [...prev];
                const idx = updated.findIndex(m => m.thinking);
                if (idx !== -1) updated[idx] = { role: "bot", text: data.answer };
                return updated;
            });
        } catch {
            setMessages(prev => {
                const updated = [...prev];
                const idx = updated.findIndex(m => m.thinking);
                if (idx !== -1) updated[idx] = { role: "bot", text: "서버 오류가 발생했습니다." };
                return updated;
            });
        }
    };

    return (
        <>
            {/* 플로팅 버튼 */}
            <button className="chat-fab" onClick={() => setOpen(true)}>
                <FaComments />
            </button>

            {open && (
                <div className="chat-modal-overlay">
                    <div className="chat-modal">

                        {/* 헤더 */}
                        <div className="chat-header">
                            <div className="chat-header-left">
                                <img
                                    src="/images/hrbot.png"
                                    alt="chatbot"
                                    className="chat-header-icon"
                                />
                                <div className="chat-header-text">
                                    <h1>HR Assistant</h1>
                                    <p>인사 · 급여 · 휴가 · 근태를 도와드려요</p>
                                </div>
                            </div>
                            <FaTimes onClick={() => setOpen(false)} />
                        </div>

                        {/* 추천 질문 */}
                        {messages.length === 0 && (
                            <div className="chat-suggestions">
                                <div onClick={() => sendMessage("연차 규정 알려줘")}>
                                    연차 규정<br /><span>연차 발생 / 사용 기준</span>
                                </div>
                                <div onClick={() => sendMessage("급여 지급일은 언제야?")}>
                                    급여 지급일<br /><span>급여일 / 명세서</span>
                                </div>
                                <div onClick={() => sendMessage("지각하면 어떻게 처리돼?")}>
                                    근태 규정<br /><span>지각 / 결근</span>
                                </div>
                            </div>
                        )}

                        {/* 채팅 로그 */}
                        <div className="chat-log" ref={chatLogRef}>
                            {messages.map((m, i) => (
                                <div className={`chat-msg ${m.role}`}>

                                    {m.role === "bot" ? (
                                        <div className="bot-wrap">
                                            {!m.thinking && (
                                                <div className="bot-meta">
                                                    <img
                                                        src="/images/hrbot.png"
                                                        alt="bot"
                                                        className="chatbot-avatar"
                                                    />
                                                    <span className="bot-label">AI 답변</span>
                                                </div>
                                            )}

                                            <div className={`bubble ${m.thinking ? "thinking" : ""}`}>
                                                {m.thinking ? (
                                                    <span className="thinking-text">답변 생성 중</span>
                                                ) : (
                                                    m.text
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bubble">{m.text}</div>
                                    )}

                                </div>
                            ))}
                        </div>

                        {/* 입력 */}
                        <div className="chat-input">
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="인사 관련 질문을 입력하세요"
                                onKeyDown={e => e.key === "Enter" && sendMessage()}
                            />
                            <button onClick={() => sendMessage()}>
                                <FaPaperPlane />
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}
