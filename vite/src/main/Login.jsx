import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Button, Form } from "react-bootstrap";
import "./styles/login.css";
import { useAuth } from "./AuthContext.jsx";
import AuthTabs from "./AuthTabs.jsx";

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth();

    const handleLogin = async () => {
        try {
            await login(email, password); // Context의 login 사용
            navigate("/main");
            alert("로그인 성공")
        } catch (err) {
            console.error(err);
            alert("로그인 실패");
        }
    };

    return (
        <Container fluid className="login-wrapper">
            <Card className="login-card">
                <AuthTabs />

                <Card.Body>
                    <h4 className="login-title">HR Management</h4>

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

                        <Button className="login-btn w-100" onClick={handleLogin}>
                            로그인
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Login;
