import { useEffect, useState } from "react";
import axios from "axios";
import "./styles/record.css";

const PAGE_SIZE = 8;

const Record = () => {
    const [invite, setInvite] = useState([]);
    const [activeTab, setActiveTab] = useState("PENDING"); // 탭 상태
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // 🔹 데이터 조회
    useEffect(() => {
        const fetchInvite = async () => {
            try {
                const res = await axios.get("/back/invite", {
                    params: { status: activeTab, page, size: PAGE_SIZE },
                    withCredentials: true,
                });

                // 서버에서 이미 status 필터링됨
                setInvite(res.data.content);
                setTotalPages(res.data.totalPages);
            } catch (e) {
                console.error(e);
            }
        };

        fetchInvite();
    }, [activeTab, page]);

    // 🔹 탭 변경
    const changeTab = (status) => {
        setActiveTab(status);
        setPage(0);
    };

    // 🔹 삭제
    const deleteInvite = async (id) => {
        try {
            await axios.delete("/back/invite/" + id, { withCredentials: true });
            alert(id + " 삭제 성공");
            setInvite((prev) => prev.filter((i) => i.id !== id));
        } catch (e) {
            alert("삭제 실패 " + e);
        }
    };

    return (
        <div className="page-wrapper">
            {/* ===== 제목 ===== */}
            <div className="content-wrapper">
                <h2>초대 기록</h2>
            </div>

            <div className="section-gap" />

            {/* ===== 테이블 영역 ===== */}
            <div className="content-wrapper">
                <h4 className="content-subtitle">초대 기록</h4>

                {/* ===== 탭 ===== */}
                <div className="record-tabs">
                    <button
                        className={`record-tab ${activeTab === "PENDING" ? "active" : ""}`}
                        onClick={() => changeTab("PENDING")}
                    >
                        미완료 초대
                    </button>
                    <button
                        className={`record-tab ${activeTab === "COMPLETED" ? "active" : ""}`}
                        onClick={() => changeTab("COMPLETED")}
                    >
                        완료된 초대
                    </button>
                </div>

                {/* ===== 스크롤 테이블 ===== */}
                <div className="record-table-wrapper">
                    <table className="record-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>사원ID</th>
                            <th>이메일</th>
                            <th>상태</th>
                            <th>생성일</th>
                            <th>완료일</th>
                            {activeTab === "COMPLETED" && <th>삭제</th>}
                        </tr>
                        </thead>
                        <tbody>
                        {invite.length === 0 && (
                            <tr>
                                <td
                                    colSpan={activeTab === "COMPLETED" ? 7 : 6}
                                    className="empty-row"
                                >
                                    내역이 없습니다.
                                </td>
                            </tr>
                        )}

                        {invite.map((i) => (
                            <tr key={i.id}>
                                <td>{i.id}</td>
                                <td>{i.empId}</td>
                                <td>{i.email}</td>
                                <td
                                    className={
                                        i.status === "PENDING"
                                            ? "status-pending"
                                            : "status-completed"
                                    }
                                >
                                    {i.status}
                                </td>
                                <td>{i.createdAt}</td>
                                <td>{i.completedAt ?? "-"}</td>
                                {activeTab === "COMPLETED" && (
                                    <td>
                                        <button
                                            className="fc-like-btn btn-sm"
                                            onClick={() => deleteInvite(i.id)}
                                        >
                                            삭제
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* ===== 페이지네이션 ===== */}
                <div className="pagination">
                    <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                        이전
                    </button>
                    <span>
            {page + 1} / {totalPages}
          </span>
                    <button
                        disabled={page + 1 >= totalPages}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        다음
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Record;
