import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/home.css";
import { Container, Row, Col, Nav, Navbar, Collapse } from "react-bootstrap";
import {Link, Outlet, useNavigate} from "react-router-dom";
import React, {useState} from "react";
import {useAuth} from "./AuthContext.jsx";
import AccountEditModal from "./components/AccountEditModal.jsx";
const Home = () => {

    const [openInvite,setOpenInvite]=useState(false);
    const [openHr, setOpenHr] = useState(false);
    const [openWork, setOpenWork] = useState(false);
    const [openSalary, setOpenSalary] = useState(false);
    const [openSchedule, setOpenSchedule] = useState(false);
    const [openApproval, setOpenApproval] = useState(false);
    const [openEval, setOpenEval] = useState(false);
    const [openReward, setOpenReward] = useState(false);
    const [showAccountModal, setShowAccountModal] = useState(false);

    const navigate = useNavigate();

    const { user,logout } = useAuth();


    const handleLogout = async () => {
        try {
            await logout(); // context에 정의된 logout 사용
            navigate("/"); // 로그아웃 후 로그인 페이지 이동
        } catch (err) {
            console.error("로그아웃 실패", err);
        }
    };

    return (
        <div className="admin-page">
            {/* 상단 Navbar */}
            <Navbar className="custom-navbar">
                <Container>
                          <Navbar.Brand>
                        <div className="brand">HR</div>
                    </Navbar.Brand>
                    <Nav className="ms-auto">
                        <Nav.Link
                            style={{ cursor: "pointer" }}
                            onClick={() => setShowAccountModal(true)}
                        >
                            계정
                        </Nav.Link>
                        <Nav.Link onClick={handleLogout} style={{ cursor: "pointer" }}>Logout</Nav.Link>
                    </Nav>
                </Container>
            </Navbar>

            <Container fluid>
                <Row>
                    {/* 좌측 메뉴 */}
                    <Col xs={2} className="vertical-navbar p-3">
                        <Nav className="flex-column">

                            {/* 홈 */}
                            <Nav.Link as={Link} to="/main">홈</Nav.Link>

                            {/*초대*/}
                            <Nav.Link onClick={() => setOpenInvite(!openInvite)}>
                                초대 {openInvite ? "▾" : "▸"}
                            </Nav.Link>
                            <Collapse in={openInvite}>
                                <div>
                                    <Nav className="flex-column ms-3">
                                        <Nav.Link as={Link} to="/main/invite/record">초대 내역</Nav.Link>
                                    </Nav>
                                </div>
                            </Collapse>
                            {/* 인사 */}
                            <Nav.Link as={Link} to="/main/hr/all" onClick={() => setOpenHr(!openHr)}>
                                인사 {openHr ? "▾" : "▸"}
                            </Nav.Link>
                            <Collapse in={openHr}>
                                <div>
                                    <Nav className="flex-column ms-3">
                                        <Nav.Link as={Link} to="/main/hr/all">전체</Nav.Link>
                                        <Nav.Link as={Link} to="/main/hr/dept">부서</Nav.Link>
                                        <Nav.Link as={Link} to="/main/hr/emp">사원</Nav.Link>
                                        <Nav.Link as={Link} to="/main/hr/outsourcing">파견</Nav.Link>
                                    </Nav>
                                </div>
                            </Collapse>

                            {/* 근태 */}
                            <Nav.Link onClick={() => setOpenWork(!openWork)}>
                                근태 {openWork ? "▾" : "▸"}
                            </Nav.Link>
                            <Collapse in={openWork}>
                                <div>
                                    <Nav className="flex-column ms-3">
                                        {/*근태: 일반 사원과 팀장*/}
                                        {(user?.role === "EMP" /*|| user?.role === "LEADER"*/) && (
                                            <>
                                                <Nav.Link as={Link} to="/main/work/employee/attendance">출퇴근 기록</Nav.Link>
                                                <Nav.Link as={Link} to="/main/work/employee/request">휴가(연가) 신청</Nav.Link>
                                                <Nav.Link as={Link} to="/main/work/employee/usage">연차 사용 현황</Nav.Link>
                                                <Nav.Link as={Link} to="/main/work/employee/workpolicy">근태 정책 조회</Nav.Link>
                                            </>
                                        )}
                                        {/*근태: 근태 관리자 */}
                                        {user?.role === "ATTENDANCE" && (
                                            <>
                                                <Nav.Link as={Link} to="/main/work/admin/attendance">출퇴근 내역 관리</Nav.Link>
                                                <Nav.Link as={Link} to="/main/work/admin/adminworkpolicy">근태 정책 관리</Nav.Link>
                                                <Nav.Link as={Link} to="/main/work/admin/annualleave">연차 촉진 관리</Nav.Link>
                                            </>
                                        )}
                                        {/*근태: 팀장*/}
                                        {user?.role === "LEADER" && (
                                            <>
                                                <Nav.Link as={Link} to="/main/work/admin/attendance">출퇴근 내역 관리</Nav.Link>
                                                <Nav.Link as={Link} to="/main/work/admin/leaveapproval">휴가 신청 승인</Nav.Link>
                                            </>
                                        )}
                                    </Nav>
                                </div>
                            </Collapse>

                            {/* 급여 */}
                            <Nav.Link onClick={() => setOpenSalary(!openSalary)}>
                                급여 {openSalary ? "▾" : "▸"}
                            </Nav.Link>
                            <Collapse in={openSalary}>
                                <div>
                                    <Nav className="flex-column ms-3">
                                        {/*급여: 일반사원과 팀장*/}
                                        {(user?.role === "EMP" || user?.role === "LEADER") && (
                                            <>
                                                <Nav.Link as={Link} to="/main/salary/employee/salary">급여 조회</Nav.Link>
                                                <Nav.Link as={Link} to="/main/salary/employee/oballowance">외근 수당 조회</Nav.Link>
                                                <Nav.Link as={Link} to="/main/salary/employee/salarypolicy">급여 정책 조회</Nav.Link>
                                            </>
                                        )}
                                        {/*급여: 근태 관리자*/}
                                        {user?.role === "ATTENDANCE" && (
                                            <>
                                                <Nav.Link as={Link} to="/main/salary/admin/adminsalary">급여 관리</Nav.Link>
                                                <Nav.Link as={Link} to="/main/salary/admin/adminsalarypolicy">급여 정책 관리</Nav.Link>
                                            </>
                                        )}
                                    </Nav>
                                </div>
                            </Collapse>

                            {/* 일정 */}
                            <Nav.Link onClick={() => setOpenSchedule(!openSchedule)}>
                                일정 {openSchedule ? "▾" : "▸"}
                            </Nav.Link>
                            <Collapse in={openSchedule}>
                                <div>
                                    <Nav className="flex-column ms-3">
                                        <Nav.Link as={Link} to="/main/schedule/calendar">캘린더</Nav.Link>
                                        <Nav.Link as={Link} to="/main/schedule/project">프로젝트 생성</Nav.Link>
                                        <Nav.Link as={Link} to="/main/schedule/admin/projectmanage">프로젝트 관리</Nav.Link>
                                        <Nav.Link as={Link} to="/main/schedule/meeting">회의실</Nav.Link>
                                    </Nav>
                                </div>
                            </Collapse>

                            {/* 평가 (Eval) */}
                            <Nav.Link onClick={() => setOpenEval(!openEval)}>
                                평가 {openEval ? "▾" : "▸"}
                            </Nav.Link>
                            <Collapse in={openEval}>
                                <div>
                                    <Nav className="flex-column ms-3">
                                        <Nav.Link as={Link} to="/main/eval/admin/item">평가 항목 관리</Nav.Link>
                                        <Nav.Link as={Link} to="/main/eval/admin/input">사원 평가 입력</Nav.Link>
                                        <Nav.Link as={Link} to="/main/eval/view">평가 조회</Nav.Link>
                                        <Nav.Link as={Link} to="/main/eval/admin/recommend">사원 추천</Nav.Link>
                                    </Nav>
                                </div>
                            </Collapse>

                            {/* 포상 (Reward) */}
                            <Nav.Link onClick={() => setOpenReward(!openReward)}>
                                포상 {openReward ? "▾" : "▸"}
                            </Nav.Link>
                            <Collapse in={openReward}>
                                <div>
                                    <Nav className="flex-column ms-3">
                                        <Nav.Link as={Link} to="/main/reward/admin/policy">포상 정책 관리</Nav.Link>
                                        <Nav.Link as={Link} to="/main/reward/admin/candidate">포상 후보 추천</Nav.Link>
                                        <Nav.Link as={Link} to="/main/reward/history">포상 이력</Nav.Link>
                                    </Nav>
                                </div>
                            </Collapse>

                            {/* 전자결재 */}
                            <Nav.Link onClick={() => setOpenApproval(!openApproval)}>
                                전자결재 {openApproval ? "▾" : "▸"}
                            </Nav.Link>
                            <Collapse in={openApproval}>
                                <div>
                                    <Nav className="flex-column ms-3">
                                        <Nav.Link as={Link} to="/main/approval/request">결재신청</Nav.Link>
                                        <Nav.Link as={Link} to="/main/approval/pending">결재대기</Nav.Link>
                                        <Nav.Link as={Link} to="/main/approval/history">결재이력</Nav.Link>
                                    </Nav>
                                </div>
                            </Collapse>

                        </Nav>
                    </Col>

                    {/* 메인 콘텐츠 */}
                    <Col className="main-content p-0">
                        <Outlet />
                    </Col>
                </Row>
            </Container>
            <AccountEditModal
                show={showAccountModal}
                onClose={() => setShowAccountModal(false)}
            />
        </div>
    );
};

export default Home;
