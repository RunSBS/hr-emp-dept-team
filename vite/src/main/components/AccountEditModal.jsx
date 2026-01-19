import { Modal, Button, Form } from "react-bootstrap";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/accountEditModal.css";
import { useAuth } from "../AuthContext.jsx";

const AccountEditModal = ({ show, onClose }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    console.log(user);

    // 탭 상태
    const [activeTab, setActiveTab] = useState("info"); // info | security

    // 비밀번호 상태
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // =========================
    // 비밀번호 변경
    // =========================
    const handlePasswordChange = async () => {
        if (!currentPassword || !newPassword) {
            alert("비밀번호를 모두 입력해주세요.");
            return;
        }

        if (newPassword.length < 8) {
            alert("비밀번호는 최소 8자 이상이어야 합니다.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("새 비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            setLoading(true);

            await axios.put("/back/signup/password", {
                currentPassword,
                newPassword,
            });

            alert("비밀번호가 변경되었습니다. 다시 로그인해주세요.");

            onClose();
            navigate("/");
        } catch (err) {
            console.error(err);
            alert(
                err.response?.data?.message ||
                "비밀번호 변경에 실패했습니다."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // 회원 탈퇴
    // =========================
    const handleWithdraw = async () => {
        if (!window.confirm("정말 탈퇴하시겠습니까?\n이 작업은 되돌릴 수 없습니다.")) {
            return;
        }

        try {
            setLoading(true);

            await axios.delete("/back/signup/me");

            alert("회원 탈퇴가 완료되었습니다.");

            onClose();
            navigate("/");
        } catch (err) {
            console.error(err);
            alert(
                err.response?.data?.message ||
                "회원 탈퇴에 실패했습니다."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onClose} centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>계정 관리</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {/* =========================
                    상단 탭 버튼
                ========================= */}
                <div className="account-tab mb-3">
                    <Button
                        variant={activeTab === "info" ? "primary" : "outline-secondary"}
                        size="sm"
                        onClick={() => setActiveTab("info")}
                    >
                        계정 정보
                    </Button>

                    <Button
                        variant={activeTab === "security" ? "primary" : "outline-secondary"}
                        size="sm"
                        onClick={() => setActiveTab("security")}
                    >
                        보안 설정
                    </Button>
                </div>

                {/* =========================
                    계정 정보 탭
                ========================= */}
                {activeTab === "info" && (
                    <div className="account-section">
                        <h5>내 계정 정보</h5>

                        <div className="info-row">
                            <span className="label">이메일</span>
                            <span className="value">{user?.email}</span>
                        </div>

                        <div className="info-row">
                            <span className="label">권한</span>
                            <span className="value">{user?.role}</span>
                        </div>
                    </div>
                )}

                {/* =========================
                    보안 설정 탭
                ========================= */}
                {activeTab === "security" && (
                    <>
                        {/* 비밀번호 변경 */}
                        <div className="account-section">
                            <h5>비밀번호 변경</h5>

                            <Form.Group className="mb-2">
                                <Form.Label>현재 비밀번호</Form.Label>
                                <Form.Control
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group className="mb-2">
                                <Form.Label>새 비밀번호</Form.Label>
                                <Form.Control
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <Form.Text className="text-muted">
                                    비밀번호는 8자 이상이어야 합니다.
                                </Form.Text>
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>새 비밀번호 확인</Form.Label>
                                <Form.Control
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </Form.Group>

                            <Button
                                className="fc-like-btn mt-3"
                                onClick={handlePasswordChange}
                                disabled={loading}
                            >
                                비밀번호 변경
                            </Button>
                        </div>

                        <hr />

                        {/* 회원 탈퇴 */}
                        <div className="account-section">
                            <h5 className="text-danger">회원 탈퇴</h5>
                            <p className="text-muted small">
                                탈퇴 시 계정 정보는 복구할 수 없습니다.
                            </p>

                            <Button
                                variant="danger"
                                size="sm"
                                onClick={handleWithdraw}
                                disabled={loading}
                            >
                                회원 탈퇴
                            </Button>
                        </div>
                    </>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default AccountEditModal;
