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
import Candidate from "../features/reward/pages/Candidate.jsx";
import Calender from "../features/schedule/pages/Calender.jsx";
import Project from "../features/schedule/pages/Project.jsx";
import ProjectManage from "../features/schedule/pages/ProjectManage.jsx";
import Meeting from "../features/schedule/pages/Meeting.jsx";
import Attendance from "../features/work/pages/Attendance.jsx";
import LeaveRequest from "../features/work/pages/LeaveRequest.jsx";
import LeaveStatus from "../features/work/pages/LeaveStatus.jsx";
import AnnualUsage from "../features/work/pages/AnnualUsage.jsx";
import WorkPolicy from "../features/work/pages/WorkPolicy.jsx";
import AdminAttendance from "../features/work/pages/AdminAttendance.jsx";
import AdminPolicy from "../features/work/pages/AdminPolicy.jsx";
import LeaveApproval from "../features/work/pages/LeaveApproval.jsx";
import AnnualPromotion from "../features/work/pages/AnnualPromotion.jsx";
import Dispatch from "../features/hrm/pages/Dispatch.jsx";
import EmpSign from "./EmpSign.jsx";
import Record from "../features/invite/Record.jsx";
function Router() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/sign" element={<Sign />} />
            <Route path="/empsign" element={<EmpSign />} />
            <Route path="/main" element={<Home />}>
                <Route index  element={<EmpMain />}/>   {/* /main */}

                <Route path="invite">
                    <Route path="record"   element={<Record/>}/>
                </Route>

                <Route path="hr">
                    <Route path="all"   element={<All />}/>
                    <Route path="dept"  element={<Dept />}/>
                    <Route path="emp"   element={<Emp />}/>
                    <Route path="dispatch"   element={<Dispatch />}/>
                </Route>

                <Route path="work">
                    {/* 개인 근태 */}
                    <Route path="attendance" element={<Attendance />} />
                    <Route path="request" element={<LeaveRequest />} />
                    <Route path="status" element={<LeaveStatus />} />
                    <Route path="usage" element={<AnnualUsage />} />
                    <Route path="policy" element={<WorkPolicy />} />

                    {/* 관리자 근태 */}
                    <Route path="admin/attendance" element={<AdminAttendance />} />
                    <Route path="admin/policy" element={<AdminPolicy/>} />
                    <Route path="admin/leaveapproval" element={<LeaveApproval />} />
                    <Route path="admin/annualpromotion" element={<AnnualPromotion />} />
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
                <Route path="history"  element={<History />}/>
                </Route>

                <Route path="approval">
                <Route path="request"   element={<Request />}/>
                <Route path="pending" element={<Pending />}/>
                <Route path="history" element={<History />}/>
                </Route>
            </Route>
        </Routes>
    );
}

export default Router;
