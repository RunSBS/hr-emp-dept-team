import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
// 1. useRef를 import에 추가합니다.
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ScheduleModal from "../components/ScheduleModal.jsx";
import { useAuth } from "../../../main/AuthContext.jsx";
import "../styles/calender.css";

const Calendar = () => {
    const { user } = useAuth();

    // 2. 캘린더 API에 접근하기 위한 ref를 생성합니다.
    const calendarRef = useRef(null);

    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [events, setEvents] = useState([]);
    const [daySchedules, setDaySchedules] = useState([]);

    /* 전체 일정 조회 */
    const loadSchedules = async () => {
        try {
            const res = await axios.get("/back/schedules");
            setEvents(
                res.data.map(s => ({
                    id: s.id,
                    title: s.title,
                    start: s.startAt,
                    end: s.endAt
                }))
            );
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadSchedules();
    }, []);

    /* 날짜 클릭 → READ 전용 */
    const handleDateClick = async (info) => {
        setSelectedDate(info.dateStr);

        try {
            const res = await axios.get("/back/schedules");
            const dayList = res.data.filter(s => {
                const start = s.startAt.slice(0, 10);
                const end = s.endAt.slice(0, 10);
                return start <= info.dateStr && info.dateStr <= end;
            });
            setDaySchedules(dayList);
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

    return (
        <>
            <FullCalendar
                ref={calendarRef} // 4. ref 연결
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={events}
                height="auto"
                dateClick={handleDateClick}
                handleWindowResize={true}
                stickyHeaderDates={true}
                customButtons={{
                    addSchedule: {
                        text: "+",
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
            />

            {showModal && (
                <ScheduleModal
                    date={selectedDate}
                    schedules={daySchedules}
                    empId={user.empId}
                    autoCreate={selectedDate === null}
                    onClose={handleCloseModal} // 5. 정의한 핸들러 연결
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
                            } catch (err) {
                                console.error(err);
                                setDaySchedules([]);
                            }
                        }
                    }}
                />
            )}
        </>
    );
};

export default Calendar;