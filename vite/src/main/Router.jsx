import { Routes, Route } from 'react-router-dom';
import Login from './Login.jsx';
import Sign from './Sign.jsx';
import Home from './Home.jsx';

import EmpMain from './EmpMain.jsx'
import Request from "../features/approval/pages/Request.jsx";
import Pending from "../features/approval/pages/Pending.jsx";
import History from "../features/approval/pages/History.jsx";
import All from "../features/hrm/pages/All.jsx";
import Dept from "../features/hrm/pages/Dept.jsx";
import Emp from "../features/hrm/pages/Emp.jsx";
import Item from "../features/evaluation/pages/Item.jsx";
import Input from "../features/evaluation/pages/Input.jsx";
import View from "../features/evaluation/pages/View.jsx";
import Recommend from "../features/evaluation/pages/Recommend.jsx";
import Policy from "../features/reward/pages/Policy.jsx";
import RewardHistory from "../features/reward/pages/RewardHistory.jsx";
import Candidate from "../features/reward/pages/Candidate.jsx";
import Calender from "../features/schedule/pages/Calender.jsx";
import Project from "../features/schedule/pages/Project.jsx";
import ProjectManage from "../features/schedule/pages/ProjectManage.jsx";
import Meeting from "../features/schedule/pages/Meeting.jsx";
import Attendance from "../features/work/pages/employee/Attendance.jsx";
import LeaveRequest from "../features/work/pages/employee/LeaveRequest.jsx";
import AnnualUsage from "../features/work/pages/employee/AnnualUsage.jsx";
import WorkPolicy from "../features/work/pages/employee/WorkPolicy.jsx";
import AdminAttendance from "../features/work/pages/admin/AdminAttendance.jsx";
import AdminWorkPolicy from "../features/work/pages/admin/AdminWorkPolicy.jsx";
import LeaveApproval from "../features/work/pages/admin/LeaveApproval.jsx";
import AnnualLeave from "../features/work/pages/admin/AnnualLeave.jsx";
import Salary from "../features/salary/pages/employee/Salary";
import AttendanceAI from "../features/work/pages/admin/AttendanceAI.jsx";
import SalaryPolicy from "../features/salary/pages/employee/SalaryPolicy";
import AdminSalary from "../features/salary/pages/admin/AdminSalary";
import AdminSalaryPolicy from "../features/salary/pages/admin/AdminSalaryPolicy";
import EmpSign from "./EmpSign.jsx";
import Record from "../features/invite/Record.jsx";
import ApprovalLayout from "../features/approval/components/ApprovalLayout.jsx";
import Detail from "../features/approval/pages/Detail.jsx";
import Outsourcing from "../features/hrm/pages/Outsourcing.jsx";
import LeaderAttendance from "../features/work/pages/admin/LeaderAttendance.jsx";
function Router() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/sign" element={<Sign />} />
            <Route path="/empsign" element={<EmpSign />} />
            <Route path="/main" element={<Home />}>
                <Route index  element={<Calender/>}/>   {/* /main */}

                <Route path="invite">
                    <Route path="record"   element={<Record/>}/>
                </Route>

                <Route path="hr">
                    <Route path="all"   element={<All />}/>
                    <Route path="dept"  element={<Dept />}/>
                    <Route path="emp"   element={<Emp />}/>
                    <Route path="outsourcing"   element={<Outsourcing />}/>
                </Route>

                <Route path="work">
                    {/* 개인 근태 */}
                    <Route path="employee/attendance" element={<Attendance />} />
                    <Route path="employee/leaverequest" element={<LeaveRequest />} />
                    <Route path="employee/usage" element={<AnnualUsage />} />
                    <Route path="employee/workpolicy" element={<WorkPolicy />} />

                    {/* 관리자 근태 */}
                    <Route path="admin/attendance" element={<AdminAttendance />} />
                    <Route path="admin/attendanceai" element={<AttendanceAI />} />
                    <Route path="admin/adminworkpolicy" element={<AdminWorkPolicy />} />
                    <Route path="admin/leaveapproval" element={<LeaveApproval />} />
                    <Route path="admin/annualleave" element={<AnnualLeave />} />
                    <Route path="admin/leaderattendance" element={<LeaderAttendance />}/>
                </Route>

                <Route path="salary">
                    {/* 일반사원 급여 */}
                    <Route path="employee/salary" element={<Salary />} />
                    <Route path="employee/salarypolicy" element={<SalaryPolicy />} />

                    {/* 관리자 급여 */}
                    <Route path="admin/adminsalary" element={<AdminSalary />} />
                    <Route path="admin/adminsalarypolicy" element={<AdminSalaryPolicy />} />
                </Route>

                <Route path="schedule">
                <Route path="calendar"   element={<Calender />}/>
                <Route path="project" element={<Project />}/>
                <Route path="admin/projectmanage" element={<ProjectManage />}/>
                <Route path="meeting" element={<Meeting />}/>
                </Route>

                <Route path="eval">
                <Route path="admin/item"   element={<Item />}/>
                <Route path="admin/input" element={<Input />}/>
                <Route path="view" element={<View />}/>
                <Route path="admin/recommend" element={<Recommend />}/>
                </Route>

                <Route path="reward">
                <Route path="admin/policy"   element={<Policy />}/>
                <Route path="admin/candidate"  element={<Candidate />}/>
                <Route path="history"  element={<RewardHistory />}/>
                </Route>

                <Route path="approval" element={<ApprovalLayout />}>
                    <Route path="request" element={<Request />} />
                    <Route path="pending" element={<Pending />} />
                    <Route path="history" element={<History />} />
                    <Route path="detail/:approvalId" element={<Detail />} />
                </Route>

            </Route>
        </Routes>
    );
}

export default Router;
