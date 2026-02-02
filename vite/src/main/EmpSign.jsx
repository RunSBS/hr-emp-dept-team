import {useEffect, useState} from "react";
import { useNavigate ,useSearchParams} from "react-router-dom";
import { Container, Card, Button, Form } from "react-bootstrap";
import "./styles/login.css";
import AuthTabs from "./AuthTabs.jsx";

const EmpSign = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");

    useEffect(() => {
        const emailParam = searchParams.get("email");
        if (emailParam) {
            setEmail(emailParam);
        }
    }, [searchParams]);

    const handleSignUp = async () => {
        if (!email || !password) {
            alert("이메일과 비밀번호를 입력하세요");
            return;
        }
        let valid = true;
        // 비밀번호 검증
        if (password.length < 8) {
            setPasswordError("비밀번호는 최소 8자 이상이어야 합니다.");
            valid = false;
        } else {
            setPasswordError("");
        }

        if (!valid) return;
        try {
            const res = await fetch("/back/signup/emp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) throw new Error("회원가입 실패");

            alert("사원 회원가입 성공");
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
                    <h4 className="login-title">사원 회원가입</h4>

                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Control
                                type="email"
                                value={email}
                                placeholder={email ? "" : "초대된 이메일을 통해 접근해 주세요"}
                                disabled   // 수정 불가
                                readOnly   // 모바일 대응
                                className="bg-light"
                            />
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
                            사원 회원가입
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default EmpSign;
