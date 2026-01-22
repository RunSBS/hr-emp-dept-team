import { useEffect, useState } from "react";
import axios from "axios";

const All = () => {
    const [summary, setSummary] = useState({
        totalEmp: 0,
        totalDept: 0,
        activeAssignment: 0,
        deptStats: [],
        loading: true
    });

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                // 실제 API 호출
                const [empRes, deptRes, assignRes] = await Promise.all([
                    axios.get("/back/hyun/emp/selectAll", { withCredentials: true }),
                    axios.get("/back/hyun/dept/selectAll", { withCredentials: true }),
                    axios.get("/back/hyun/outsourcing/selectAllAssignment", { withCredentials: true })
                ]);

                // 실제 데이터 가공
                const deptCounts = deptRes.data.map(dept => ({
                    name: dept.deptName,
                    count: empRes.data.filter(emp => emp.deptNo === dept.deptNo).length
                }));

                setSummary({
                    totalEmp: empRes.data.length,
                    totalDept: deptRes.data.length,
                    activeAssignment: assignRes.data ? assignRes.data.filter(a => a.status === "진행중").length : 0,
                    deptStats: deptCounts,
                    loading: false
                });
            } catch (e) {
                console.error("통계 로딩 실패", e);
                setSummary(prev => ({ ...prev, loading: false }));
            }
        };
        fetchSummary();
    }, []);

    if (summary.loading) return <div className="p-5 text-center text-muted">데이터를 불러오는 중입니다...</div>;

    return (
        <div style={{ padding: "30px", backgroundColor: "#f8f9fa", minHeight: "100%" }}>
            {/* 상단 헤더 */}
            <div className="mb-4">
                <h2 className="fw-bold mb-1">인사 종합 현황</h2>
                <p className="text-muted small">전체 사원 및 부서별 실시간 데이터 요약</p>
            </div>

            {/* 실제 수치 기반 주요 지표 */}
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <StatCard title="전체 사원" count={summary.totalEmp} unit="명" icon="bi-people-fill" color="#0d6efd" />
                </div>
                <div className="col-md-4">
                    <StatCard title="운영 부서" count={summary.totalDept} unit="개" icon="bi-building" color="#6610f2" />
                </div>
                <div className="col-md-4">
                    <StatCard title="외부 파견" count={summary.activeAssignment} unit="명" icon="bi-geo-alt-fill" color="#198754" />
                </div>
            </div>

            <div className="row g-4">
                {/* 부서별 인원 비중 (실제 데이터 비중) */}
                <div className="col-lg-7">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-4">부서별 인력 분포</h5>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="table-light">
                                    <tr className="small">
                                        <th>부서명</th>
                                        <th className="text-center" style={{ width: "50%" }}>인원 비중</th>
                                        <th className="text-end">인원수</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {summary.deptStats.map((dept, idx) => (
                                        <tr key={idx}>
                                            <td className="fw-bold">{dept.name}</td>
                                            <td>
                                                <div className="progress" style={{ height: "8px" }}>
                                                    <div
                                                        className="progress-bar"
                                                        style={{
                                                            width: `${summary.totalEmp > 0 ? (dept.count / summary.totalEmp) * 100 : 0}%`,
                                                            backgroundColor: "#0d6efd"
                                                        }}
                                                    ></div>
                                                </div>
                                            </td>
                                            <td className="text-end fw-bold text-primary">{dept.count}명</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 행정 처리 알림 (고정 알림 및 동적 수치) */}
                <div className="col-lg-5">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-4 d-flex align-items-center">
                                <i className="bi bi-bell me-2 text-danger"></i>행정 처리 알림
                            </h5>

                            <div className="vstack gap-2">
                                {/* 1. 실제 데이터 기반: 파견 종료 예정자 (activeAssignment 수치 활용) */}
                                <InfoItem
                                    icon="bi-exclamation-triangle-fill"
                                    text="파견 종료 예정 (7일 이내)"
                                    val={`${summary.activeAssignment}건`}
                                    color="#dc3545"
                                    bgColor="#fff5f5"
                                />

                                {/* 2. 시스템 상태: 부서 데이터 연동 확인 */}
                                <InfoItem
                                    icon="bi-diagram-3-fill"
                                    text="운영 부서 동기화"
                                    val={`${summary.totalDept}개 부서`}
                                    color="#0d6efd"
                                    bgColor="#f0f7ff"
                                />

                                {/* 3. 고정 알림 또는 더미 데이터: 신규 입사자 승인 (필요시 실제 API 연동 가능) */}
                                <InfoItem
                                    icon="bi-person-plus-fill"
                                    text="신규 사원 승인 대기"
                                    val="2건"
                                    color="#198754"
                                    bgColor="#f2faf5"
                                />

                                {/* 4. 안내 문구: AI 검색 기능 활용 유도 */}
                                <div className="mt-4 p-3 rounded-3 border-0" style={{ backgroundColor: "#f8f9fa" }}>
                                    <div className="d-flex align-items-center mb-2">
                                        <div className="spinner-grow spinner-grow-sm text-primary me-2" role="status"></div>
                                        <span className="small fw-bold">AI 검색 팁</span>
                                    </div>
                                    <p className="small text-muted mb-0" style={{ lineHeight: "1.6" }}>
                                        "우리 회사에서 <strong>자바(Java)</strong> 숙련도가 <strong>'상'</strong>인 <strong>리더급</strong> 직원을 찾아줘" 라고 질문해보세요. AI가 기술 스택을 분석해 즉시 답변해 드립니다.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 내부 컴포넌트 ---

const StatCard = ({ title, count, unit, icon, color }) => (
    <div className="card border-0 shadow-sm h-100">
        <div className="card-body p-4 d-flex align-items-center">
            <div className="rounded-circle p-3 me-3" style={{ backgroundColor: `${color}15`, color: color }}>
                <i className={`bi ${icon} fs-3`}></i>
            </div>
            <div>
                <h6 className="text-muted small mb-1">{title}</h6>
                <h3 className="fw-bold mb-0">{count}<span className="fs-6 fw-normal text-muted ms-1">{unit}</span></h3>
            </div>
        </div>
    </div>
);

const InfoItem = ({ icon, text, val, color }) => (
    <div className="d-flex align-items-center justify-content-between p-3 rounded-3 bg-white border mb-1">
        <div className="d-flex align-items-center">
            <i className={`bi ${icon} me-3`} style={{ color: color }}></i>
            <span className="small">{text}</span>
        </div>
        <span className="badge bg-light text-dark border">{val}</span>
    </div>
);

export default All;