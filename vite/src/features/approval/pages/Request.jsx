import React, { useState } from "react";
import { Form, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../main/AuthContext";

const approvalTypes = [
    { id: 1, name: "휴가 신청" },
    { id: 2, name: "출장 신청" }
];

const Request = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    if (!user) {
        return null; // 또는 로딩 UI
    }

    const [form, setForm] = useState({
        typeId: "",
        title: "",
        content: "",
        files: []
    });


    const empId = user.empId;

    if (!empId) {
        alert("로그인 후 결재 신청이 가능합니다.");
        return null;
    }

    /* -------------------------------
       입력 핸들러
    -------------------------------- */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files).map(file => ({
            fileName: file.name,
            fileSize: file.size,
            filePaths: "/temp"
        }));

        setForm(prev => ({ ...prev, files }));
    };

    /* -------------------------------
       Submit
    -------------------------------- */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 실제 로그인 사용자 empId 사용
        const payload = {
            empId: empId,
            typeId: form.typeId || 1,
            title: form.title || "제목 없음",
            content: form.content || "",
            files: form.files
        };

        const res = await fetch("/back/ho/approvals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const data = await res.json();
            alert("결재 신청 완료");
            navigate("/main/approval/pending");
        } else {
            alert("결재 신청 실패");
        }
    };

    /* -------------------------------
       Render
    -------------------------------- */
    return (
        <Card>
            <Card.Header>결재 신청</Card.Header>
            <Card.Body>
                <Form onSubmit={handleSubmit}>

                    {/* 결재 유형 */}
                    <Form.Group className="mb-3">
                        <Form.Label>결재 유형</Form.Label>
                        <Form.Select
                            name="typeId"
                            value={form.typeId}
                            onChange={handleChange}
                        >
                            <option value="">선택</option>
                            {approvalTypes.map(type => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    {/* 제목 */}
                    <Form.Group className="mb-3">
                        <Form.Label>제목</Form.Label>
                        <Form.Control
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="제목을 입력하세요"
                        />
                    </Form.Group>

                    {/* 내용 */}
                    <Form.Group className="mb-3">
                        <Form.Label>내용</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={6}
                            name="content"
                            value={form.content}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    {/* 첨부 파일 */}
                    <Form.Group className="mb-3">
                        <Form.Label>첨부 파일</Form.Label>
                        <Form.Control
                            type="file"
                            multiple
                            onChange={handleFileChange}
                        />
                    </Form.Group>

                    <Button type="submit">결재 신청</Button>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default Request;
