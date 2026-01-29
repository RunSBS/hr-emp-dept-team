import React, { useState, useRef, useEffect, useCallback } from "react";
import "../styles/chatWidget.css";
import { FaComments, FaTimes, FaPaperPlane, FaUndo } from "react-icons/fa";

export default function ChatWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const chatLogRef = useRef(null);

    // 통계 데이터를 가져오는 로직을 별도 함수로 분리
    const fetchStats = useCallback(async () => {
        try {
            const resp = await fetch("/ai/chatbot/stats");
            const data = await resp.json();

            if (data && data.length > 0) {
                const top3 = data.slice(0, 3).map(item => ({
                    title: item.title,
                    sub: `누적 질문 ${item.count}건`
                }));
                setSuggestions(top3);
            } else {
                setSuggestions([]);
            }
        } catch (err) {
            console.error("통계 로딩 실패:", err);
            setSuggestions([]);
        }
    }, []);

    // 자동 스크롤
    useEffect(() => {
        if (chatLogRef.current) {
            chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
        }
    }, [messages]);

    // ✅ 위젯이 열릴 때마다 통계 새로고침 (핫리로드)
    useEffect(() => {
        if (open) {
            fetchStats();
        }
    }, [open, fetchStats]);

    // 대화 초기화 함수
    const resetChat = async () => {
        if (window.confirm("대화 내역을 초기화하시겠습니까?")) {
            setMessages([]);
            setInput("");

            // ✅ 초기화 시 통계 데이터를 다시 불러와서 최신 상태로 갱신
            await fetchStats();

            // (선택 사항) 서버의 chat_history도 비우고 싶다면 여기에 fetch("/ai/chatbot/reset") 추가
        }
    };

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
                if (idx !== -1) updated[idx] = { role: "bot", text: data.answer, thinking: false };
                return updated;
            });
        } catch (error) {
            setMessages(prev => {
                const updated = [...prev];
                const idx = updated.findIndex(m => m.thinking);
                if (idx !== -1) updated[idx] = { role: "bot", text: "서버 오류가 발생했습니다.", thinking: false };
                return updated;
            });
        }
    };

    return (
        <>
            <button className="chat-fab" onClick={() => setOpen(true)}>
                <FaComments />
            </button>

            {open && (
                <div className="chat-modal-overlay">
                    <div className="chat-modal">
                        <div className="chat-header">
                            <div className="chat-header-left">
                                <img src="/images/hrbot.png" alt="chatbot" className="chat-header-icon" />
                                <div className="chat-header-text">
                                    <h1>HR Assistant</h1>
                                    <p>인사 · 근태 · 급여 · 일정 · 평가 · 전자결재에 대하여 질문하세요.</p>
                                </div>
                            </div>
                            <div className="chat-header-btns">
                                <FaUndo className="reset-icon" onClick={resetChat} title="대화 초기화" />
                                <FaTimes className="close-icon" onClick={() => setOpen(false)} />
                            </div>
                        </div>

                        {messages.length === 0 && (
                            <div className="chat-suggestions">
                                {suggestions.length > 0 ? (
                                    suggestions.map((s, idx) => (
                                        <div key={idx} className="suggestion-item" onClick={() => sendMessage(s.title)}>
                                            {s.title}<br /><span>{s.sub}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-suggestions">많이 한 질문이 아직 없어요 질문을 생성하세요!</div>
                                )}
                            </div>
                        )}

                        <div className="chat-log" ref={chatLogRef}>
                            {messages.map((m, idx) => (
                                <div key={idx} className={`chat-msg ${m.role}`}>
                                    {m.role === "bot" ? (
                                        <div className="bot-wrap">
                                            {!m.thinking && (
                                                <div className="bot-meta">
                                                    <img src="/images/hrbot.png" alt="bot" className="chatbot-avatar" />
                                                    <span className="bot-label">AI 답변</span>
                                                </div>
                                            )}
                                            <div className={`bubble ${m.thinking ? "thinking" : ""}`}>
                                                {m.thinking ? <span className="thinking-text">답변 생성 중...</span> : m.text}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bubble">{m.text}</div>
                                    )}
                                </div>
                            ))}
                        </div>

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