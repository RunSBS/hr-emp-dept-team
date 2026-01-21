import { Form, Button, Card } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../main/AuthContext";
import React, { useState } from "react";

const Request = () => {
    const navigate = useNavigate();
    const { state } = useLocation();  // Select에서 전달된 type 객체
    const { user } = useAuth();

    const type = state?.type;  // 바로 사용
    const [form, setForm] = useState({
        title: "",
        content: ""
    });

    if (!type) {
        return <div>결재 유형 정보가 없습니다.</div>;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        // FormData 대신 JSON으로 전송
        const res = await fetch("/back/ho/approvals", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                empId: user.empId,
                typeId: type.typeId,
                title: form.title,
                content: form.content
            })
        });

        if (res.ok) {
            alert("결재 신청이 완료되었습니다.");
            navigate("/main/approval/pending");
        } else {
            const text = await res.text();
            alert("전송 실패: " + text);
        }
    };

    return (
        <Card>
            <Card.Header>
                <strong>결재 신청</strong>
            </Card.Header>

            <Card.Body>
                <Form onSubmit={handleSubmit}>
                    {/* 결재 유형 (readonly) */}
                    <Form.Group className="mb-3">
                        <Form.Label>결재 유형</Form.Label>
                        <Form.Control
                            value={type.description} // 한글 표시
                            readOnly
                            style={{
                                backgroundColor: "#f8f9fa",
                                color: "#212529",
                                fontWeight: "500"
                            }}
                        />
                    </Form.Group>

                    {/* 제목 */}
                    <Form.Group className="mb-3">
                        <Form.Label>제목</Form.Label>
                        <Form.Control
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            required
                        />
                    </Form.Group>

                    {/* 내용 */}
                    <Form.Group className="mb-3">
                        <Form.Label>내용</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={6}
                            value={form.content}
                            onChange={e => setForm({ ...form, content: e.target.value })}
                            required
                        />
                    </Form.Group>

                    <div className="d-flex justify-content-end gap-2">
                        <Button variant="secondary" onClick={() => navigate(-1)}>
                            취소
                        </Button>
                        <Button type="submit">
                            결재 신청
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default Request;
