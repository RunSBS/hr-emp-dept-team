import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Card, Button, Form } from "react-bootstrap";
import "./styles/login.css";

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            const params = new URLSearchParams();
            params.append("email", email);
            params.append("password", password);

            await axios.post("/back/login", params, {
                withCredentials: true,//세션쿠키 포함
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            });

            alert("로그인 성공");
            navigate("/main");
        } catch (err) {
            console.log(err);
            alert("로그인 실패: " + (err.response?.status || err.message));
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
