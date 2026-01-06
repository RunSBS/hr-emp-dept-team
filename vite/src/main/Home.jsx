import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/home.css";
import { Container, Row, Col, Nav, Navbar, Collapse } from "react-bootstrap";
import { Link, Outlet } from "react-router-dom";
import React, { useState } from "react";

const Home = () => {
    const [openHr, setOpenHr] = useState(false);
    const [openWork, setOpenWork] = useState(false);
    const [openSchedule, setOpenSchedule] = useState(false);
    const [openApproval, setOpenApproval] = useState(false);
    const [openEval, setOpenEval] = useState(false);
    const [openReward, setOpenReward] = useState(false);

    return (
        <div className="admin-page">
            {/* 상단 Navbar */}
            <Navbar className="custom-navbar">
                <Container>
                    <Navbar.Brand>
                        <div className="brand">HR</div>
                    </Navbar.Brand>
                    <Nav className="ms-auto">
                        <Nav.Link>settings</Nav.Link>
                        <Nav.Link as={Link} to="/">logout</Nav.Link>
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

                            {/* 인사 */}
                            <Nav.Link onClick={() => setOpenHr(!openHr)}>
                                인사 {openHr ? "▾" : "▸"}
                            </Nav.Link>
                            <Collapse in={openHr}>
                                <div>
                                    <Nav className="flex-column ms-3">
                                        <Nav.Link as={Link} to="/main/hr/all">전체</Nav.Link>
                                        <Nav.Link as={Link} to="/main/hr/dept">부서</Nav.Link>
                                        <Nav.Link as={Link} to="/main/hr/emp">사원</Nav.Link>
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
                                        <Nav.Link as={Link} to="/main/work/attendance">출퇴근 기록</Nav.Link>
                                        <Nav.Link as={Link} to="/main/work/request">휴가(연가) 신청</Nav.Link>
                                        <Nav.Link as={Link} to="/main/work/status">휴가 신청 현황</Nav.Link>
                                        <Nav.Link as={Link} to="/main/work/usage">연차 사용 현황</Nav.Link>
                                        <Nav.Link as={Link} to="/main/work/policy">근태 정책 조회</Nav.Link>
                                        <Nav.Link as={Link} to="/main/work/admin-attandance">출퇴근 내역 관리</Nav.Link>
                                        <Nav.Link as={Link} to="/main/work/admin-policy">근태 정책 관리</Nav.Link>
                                        <Nav.Link as={Link} to="/main/work/leave-approval">휴가 신청 승인</Nav.Link>
                                        <Nav.Link as={Link} to="/main/work/annual-promotion">연차 촉진 관리</Nav.Link>
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
                                        <Nav.Link as={Link} to="/main/schedule/projectmanage">프로젝트 관리</Nav.Link>
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
                                        <Nav.Link as={Link} to="/main/eval/item">평가 항목 관리</Nav.Link>
                                        <Nav.Link as={Link} to="/main/eval/input">사원 평가 입력</Nav.Link>
                                        <Nav.Link as={Link} to="/main/eval/view">평가 조회</Nav.Link>
                                        <Nav.Link as={Link} to="/main/eval/recommend">사원 추천</Nav.Link>
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
                                        <Nav.Link as={Link} to="/main/reward/policy">포상 정책 관리</Nav.Link>
                                        <Nav.Link as={Link} to="/main/reward/candidate">포상 후보 추천</Nav.Link>
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
                    <Col xs={10} className="main-content p-4">
                        <Outlet />
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Home;
