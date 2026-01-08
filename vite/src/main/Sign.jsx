import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Button, Form } from "react-bootstrap";
import "./styles/login.css";

const Sign = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSignUp = async () => {
        if (!email || !password) {
            alert("이메일과 비밀번호를 입력하세요");
            return;
        }

        try {
            const res = await fetch("/back/signup/admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) throw new Error("회원가입 실패");

            alert("관리자 회원가입 성공");
            navigate("/");
        } catch (e) {
            alert(e.message);
        }
    };

    return (
        <Container fluid className="login-wrapper">
            <Card className="login-card">

                <div className="top-btn-group">
                    <button onClick={() => navigate("/")}>로그인</button>
                    <button onClick={() => navigate("/sign")}>관리자 가입</button>
                    <button onClick={() => navigate("/empsign")}>사원 가입</button>
                </div>

                <Card.Body>
                    <h4 className="login-title">관리자 회원가입</h4>

                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Control
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Control
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </Form.Group>

                        <Button className="login-btn w-100" onClick={handleSignUp}>
                            관리자 회원가입
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Sign;
