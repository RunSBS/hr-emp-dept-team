import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Button, Form } from "react-bootstrap";
import "./styles/login.css";
import AuthTabs from "./AuthTabs.jsx";

const Sign = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");


    // 이메일 정규식 (실무에서 가장 흔함)
    const emailRegex =
        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;



    const handleSignUp = async () => {
        if (!email || !password) {
            alert("이메일과 비밀번호를 입력하세요");
            return;
        }
        let valid = true;

        // 이메일 검증
        if (!emailRegex.test(email)) {
            setEmailError("올바른 이메일 형식이 아닙니다.");
            valid = false;
        } else {
            setEmailError("");
        }
        // 비밀번호 검증
        if (password.length < 8) {
            setPasswordError("비밀번호는 최소 8자 이상이어야 합니다.");
            valid = false;
        } else {
            setPasswordError("");
        }

        if (!valid) return;
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

                <AuthTabs/>

                <Card.Body>
                    <h4 className="login-title">관리자 회원가입</h4>

                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Control
                                type="email"
                                placeholder="Email"
                                value={email}
                                isInvalid={!!emailError}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <Form.Control.Feedback type="invalid">
                                {emailError}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Control
                                type="password"
                                placeholder="Password"
                                value={password}
                                isInvalid={!!passwordError}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <Form.Control.Feedback type="invalid">
                                {passwordError}
                            </Form.Control.Feedback>
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
