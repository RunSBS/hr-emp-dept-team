import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import koLocale from "@fullcalendar/core/locales/ko";
import interactionPlugin from "@fullcalendar/interaction";
// 1. useRef를 import에 추가합니다.
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ScheduleModal from "../components/ScheduleModal.jsx";
import { useAuth } from "../../../main/AuthContext.jsx";
import "../styles/calender.css";

const Calendar = () => {
    const { user } = useAuth();
    console.log(user.empId);
    // 2. 캘린더 API에 접근하기 위한 ref를 생성합니다.
    const calendarRef = useRef(null);

    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [events, setEvents] = useState([]);
    const [daySchedules, setDaySchedules] = useState([]);
    //필터
    const [filters, setFilters] = useState({
        all:true,
        mine: true,
        project: true,
        vacation: true
    });

    const loadProjects = async () => {
        try {
            const res = await axios.get("/back/project/all");

            return res.data.map(p => ({
                id: `project-${p.id}`,      // 충돌 방지
                title: `[프로젝트] ${p.name}`,
                start: p.startDate,
                end: p.endDate,
                extendedProps: {
                    type: "project"
                },
                color: "#198754" // 초록색 (선택)
            }));
        } catch (err) {
            console.error(err);
            return [];
        }
    };

    /* 전체 일정 조회 + 필터링 */
    const loadSchedules = async () => {
        try {
            const [scheduleRes, projectEvents] = await Promise.all([
                axios.get("/back/schedules"),
                loadProjects()
            ]);

            const scheduleEvents = scheduleRes.data.map(s => ({
                id: `schedule-${s.id}`,
                title: s.title,
                start: s.startAt,
                end: s.endAt,
                extendedProps: {
                    type: "schedule",
                    empId: s.empId
                }
            }));

            let filteredSchedules = [];

            if (filters.all) {
                filteredSchedules = scheduleEvents;
            } else if (filters.mine) {
                filteredSchedules = scheduleEvents.filter(
                    e => e.extendedProps.empId === user.empId
                );
            }

            const filteredProjects =
                filters.all || filters.project
                    ? projectEvents
                    : [];

            setEvents([
                ...filteredSchedules,
                ...filteredProjects
            ]);

        } catch (err) {
            console.error(err);
        }
    };


    useEffect(() => {
        loadSchedules();
    }, [filters]);

    /* 날짜 클릭 → READ 전용 */
    const handleDateClick = async (info) => {
        setSelectedDate(info.dateStr);

        try {
            const [scheduleRes, projectRes] = await Promise.all([
                axios.get("/back/schedules"),
                axios.get("/back/project/all")
            ]);

            const schedules = scheduleRes.data
                .filter(s => {
                    const start = s.startAt.slice(0, 10);
                    const end = s.endAt.slice(0, 10);
                    return start <= info.dateStr && info.dateStr <= end;
                })
                .map(s => ({
                    ...s,
                    type: "schedule"
                }));

            const projects = projectRes.data
                .filter(p => {
                    return p.startDate <= info.dateStr && info.dateStr <= p.endDate;
                })
                .map(p => ({
                    id: `project-${p.id}`,
                    title: p.name,
                    startAt: p.startDate + "T00:00",
                    endAt: p.endDate + "T23:59",
                    type: "project"
                }));

            setDaySchedules([
                ...projects,
                ...schedules
            ]);
        } catch (err) {
            console.error(err);
            setDaySchedules([]);
        }

        setShowModal(true);
    };


    // 3. 모달을 닫을 때 실행할 함수를 별도로 정의합니다.
    const handleCloseModal = () => {
        setShowModal(false);

        // 중요: 모달이 닫히고 스크롤바가 생기는 찰나의 시간을 기다린 후 크기 재계산
        setTimeout(() => {
            if (calendarRef.current) {
                const calendarApi = calendarRef.current.getApi();
                calendarApi.updateSize(); // 캘린더의 너비/높이를 현재 컨테이너에 맞춰 다시 계산
            }
        }, 100);
    };
    //필터링 관리
    const handleAllChange = (checked) => {
        setFilters({
            all: checked,
            mine: checked,
            project: checked,
            vacation: checked
        });
    };

    const handleSubFilterChange = (key, checked) => {
        setFilters(prev => {

            if (prev.all) {
                return {
                    all: false,
                    mine: key === "mine",
                    project: key === "project",
                    vacation: key === "vacation"
                };
            }

            const next = {
                ...prev,
                [key]: checked,
                all: false
            };

            if (next.mine && next.project && next.vacation) {
                next.all = true;
            }

            return next;
        });
    };

    return (
        <div className="page-wrapper">

            {/* ===== 필터 + 캘린더 하나의 카드 ===== */}
            <div className="content-wrapper p-2 calendar-wrapper">

                {/* --- 필터 영역 --- */}
                <div className="d-flex align-items-center gap-3 mb-1">
                    <div className="fw-semibold">필터링</div>

                    <div className="d-flex gap-3 ms-2 flex-wrap">
                        <label className="d-flex align-items-center gap-1">
                            <input
                                type="checkbox"
                                checked={filters.all}
                                onChange={e => handleAllChange(e.target.checked)}
                            />
                            전체
                        </label>

                        <label className="d-flex align-items-center gap-1">
                            <input
                                type="checkbox"
                                checked={filters.mine}
                                onChange={e =>
                                    handleSubFilterChange("mine", e.target.checked)
                                }
                            />
                            내 일정만
                        </label>

                        <label className="d-flex align-items-center gap-1">
                            <input
                                type="checkbox"
                                checked={filters.project}
                                onChange={e =>
                                    handleSubFilterChange("project", e.target.checked)
                                }
                            />
                            프로젝트
                        </label>

                        <label className="d-flex align-items-center gap-1">
                            <input
                                type="checkbox"
                                checked={filters.vacation}
                                onChange={e =>
                                    handleSubFilterChange("vacation", e.target.checked)
                                }
                            />
                            휴가
                        </label>
                    </div>
                </div>

                {/* --- 캘린더 --- */}
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    events={events}
                    locale={koLocale}
                    dateClick={handleDateClick}
                    handleWindowResize={true}
                    stickyHeaderDates={true}
                    height="80vh"
                    customButtons={{
                        addSchedule: {
                            text: "+ 일정",
                            click: () => {
                                setSelectedDate(null);
                                setDaySchedules([]);
                                setShowModal(true);
                            }
                        }
                    }}
                    headerToolbar={{
                        left: "addSchedule",
                        center: "title",
                        right: "prev,next today"
                    }}
                    dayMaxEvents={3}
                    eventTimeFormat={{
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false
                    }}
                />
            </div>

            {/* ===== 모달 ===== */}
            {showModal && (
                <ScheduleModal
                    date={selectedDate}
                    schedules={daySchedules}
                    empId={user.empId}
                    autoCreate={selectedDate === null}
                    onClose={handleCloseModal}
                    onChange={async () => {
                        await loadSchedules();
                        if (selectedDate) {
                            try {
                                const res = await axios.get("/back/schedules");
                                const dayList = res.data.filter(s => {
                                    const start = s.startAt.slice(0, 10);
                                    const end = s.endAt.slice(0, 10);
                                    return start <= selectedDate && selectedDate <= end;
                                });
                                setDaySchedules(dayList);
                            } catch {
                                setDaySchedules([]);
                            }
                        }
                    }}
                />
            )}
        </div>
    );


};

export default Calendar;