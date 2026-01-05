import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Main.css";
import { Container, Row, Col, Nav, Navbar, Collapse } from "react-bootstrap";
import { Link, Outlet } from "react-router-dom";
import React, { useState } from "react";
const Main = () => {
    const [openOrg, setOpenOrg] = useState(false);
    const [openHr, setOpenHr] = useState(false);
    const [openWork, setOpenWork] = useState(false);
    const [openSchedule, setOpenSchedule] = useState(false);
    const [openPay, setOpenPay] = useState(false);
    const [openApproval, setOpenApproval] = useState(false);
    const [openNotice, setOpenNotice] = useState(false);


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

                            {/* 조직 */}
                            <Nav.Link onClick={() => setOpenOrg(!openOrg)}>
                                조직 {openOrg ? "▾" : "▸"}
                            </Nav.Link>
                            <Collapse in={openOrg}>
                                <div>
                                    <Nav className="flex-column ms-3">
                                        <Nav.Link as={Link} to="/main/org/chart">조직도</Nav.Link>
                                        <Nav.Link as={Link} to="/main/org/department">부서관리</Nav.Link>
                                        <Nav.Link as={Link} to="/main/org/position">직급관리</Nav.Link>
                                    </Nav>
                                </div>
                            </Collapse>

                            {/* 인사 */}
                            <Nav.Link onClick={() => setOpenHr(!openHr)}>
                                인사 {openHr ? "▾" : "▸"}
                            </Nav.Link>
                            <Collapse in={openHr}>
                                <div>
                                    <Nav className="flex-column ms-3">
                                        <Nav.Link as={Link} to="/main/hr/employee">사원관리</Nav.Link>
                                        <Nav.Link as={Link} to="/main/hr/invite">사원초대</Nav.Link>
                                        <Nav.Link as={Link} to="/main/hr/evaluation">인사평가</Nav.Link>
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
                                        <Nav.Link as={Link} to="/main/work/attendance">출퇴근</Nav.Link>
                                        <Nav.Link as={Link} to="/main/work/leave">휴가관리</Nav.Link>
                                        <Nav.Link as={Link} to="/main/work/overtime">초과근무</Nav.Link>
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
                                        <Nav.Link as={Link} to="/main/schedule/my">내 일정</Nav.Link>
                                        <Nav.Link as={Link} to="/main/schedule/team">팀 일정</Nav.Link>
                                    </Nav>
                                </div>
                            </Collapse>

                            {/* 보상 */}
                            <Nav.Link onClick={() => setOpenPay(!openPay)}>
                                보상 {openPay ? "▾" : "▸"}
                            </Nav.Link>
                            <Collapse in={openPay}>
                                <div>
                                    <Nav className="flex-column ms-3">
                                        <Nav.Link as={Link} to="/main/pay/salary">급여</Nav.Link>
                                        <Nav.Link as={Link} to="/main/pay/bonus">상여</Nav.Link>
                                        <Nav.Link as={Link} to="/main/pay/tax">세금</Nav.Link>
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

                            {/* 공지사항 */}
                            <Nav.Link onClick={() => setOpenNotice(!openNotice)}>
                                공지사항 {openNotice ? "▾" : "▸"}
                            </Nav.Link>
                            <Collapse in={openNotice}>
                                <div>
                                    <Nav className="flex-column ms-3">
                                        <Nav.Link as={Link} to="/main/notice/list">공지목록</Nav.Link>
                                        <Nav.Link as={Link} to="/main/notice/create">공지작성</Nav.Link>
                                        <Nav.Link as={Link} to="/main/notice/archive">보관함</Nav.Link>
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

export default Main;
