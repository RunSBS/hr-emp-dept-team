import { useEffect, useState } from "react";
import axios from "axios";

const DeptDetail = ({ selectedDept, onSuccess }) => {
    // 1. 초기 상태 설정 (엔티티/DTO 구조와 일치)
    const [form, setForm] = useState({
        deptNo: "",
        deptName: "",
        deptLoc: "",
        parentDeptNo: "", // 상위 부서 번호
        treeLevel: 0,     // 백엔드에서 계산하지만 표시용으로 유지
        siblingOrder: 1   // 기본값 1 (첫 번째 순서)
    });

    const [allDepts, setAllDepts] = useState([]); // 드롭다운용 전체 부서 리스트

    // 2. 부서 선택 시 또는 컴포넌트 로드 시 데이터 동기화
    useEffect(() => {
        // 부서 목록 최신화 (상위 부서 드롭다운용)
        axios.get("/back/hyun/dept/selectAll", { withCredentials: true })
            .then(res => setAllDepts(res.data))
            .catch(err => console.error("부서 목록 로딩 실패", err));

        if (selectedDept) {
            if (selectedDept.isNew) {
                // 신규 등록 모드
                setForm({
                    deptNo: "",
                    deptName: "",
                    deptLoc: "",
                    parentDeptNo: "",
                    treeLevel: 0,
                    siblingOrder: 1
                });
            } else {
                // 수정 모드: 전달받은 객체를 폼에 세팅
                setForm({
                    ...selectedDept,
                    // parentDeptNo가 null인 경우 빈 문자열로 처리 (select 태그 호환)
                    parentDeptNo: selectedDept.parentDeptNo || ""
                });
            }
        }
    }, [selectedDept]);

    if (!selectedDept) {
        return (
            <div style={{ padding: "20px", color: "#999", textAlign: "center", border: "1px dashed #ccc" }}>
                좌측 조직도에서 부서를 선택하거나 <br /> [새 부서 등록] 버튼을 클릭해 주세요.
            </div>
        );
    }

    // 3. 입력값 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 4. 저장 로직 (등록/수정 통합)
    const handleSave = async () => {
        const isNew = selectedDept.isNew;
        const url = isNew ? "/back/hyun/dept/insert" : "/back/hyun/dept/update";

        // 데이터 정제: 날짜 포맷 에러 방지를 위해 날짜 필드 제외 및 숫자 형변환
        const { createdAt, updatedAt, ...pureData } = form;
        const submitData = {
            ...pureData,
            deptNo: parseInt(form.deptNo),
            parentDeptNo: form.parentDeptNo === "" ? null : parseInt(form.parentDeptNo),
            siblingOrder: parseInt(form.siblingOrder || 1)
        };

        try {
            await axios({
                method: isNew ? "post" : "put",
                url,
                data: submitData,
                withCredentials: true
            });
            alert(isNew ? "새 부서가 조직도에 등록되었습니다." : "부서 정보가 수정되었습니다.");
            onSuccess(); // 부모 컴포넌트의 리스트 새로고침 함수 호출
        } catch (err) {
            console.error("저장 실패:", err);
            alert("저장에 실패했습니다. 부서 번호 중복이나 입력값을 확인하세요.");
        }
    };

    // 5. 삭제 로직
    const handleDelete = async () => {
        if (!window.confirm(`[${form.deptName}] 부서를 삭제하시겠습니까?`)) return;

        try {
            await axios.delete("/back/hyun/dept/delete", {
                data: { deptNo: form.deptNo },
                withCredentials: true
            });
            alert("삭제되었습니다.");
            onSuccess();
        } catch (err) {
            console.error("삭제 실패:", err);
            alert("삭제 실패: 하위 부서가 있거나 권한이 없을 수 있습니다.");
        }
    };

    return (
        <div style={{ padding: "10px" }}>
            <h3>{selectedDept.isNew ? "✨ 신규 부서 추가" : `📝 부서 정보 수정 (${form.deptName})`}</h3>
            <p style={{ fontSize: "0.85rem", color: "#666" }}>
                * 트리 레벨은 상위 부서 설정에 따라 자동으로 계산됩니다.
            </p>
            <hr />

            <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "15px", marginTop: "20px" }}>
                <label><strong>부서 번호 (ID)</strong></label>
                <input
                    name="deptNo"
                    type="number"
                    value={form.deptNo}
                    onChange={handleChange}
                    disabled={!selectedDept.isNew}
                    placeholder="예: 100"
                    style={{ padding: "8px", backgroundColor: !selectedDept.isNew ? "#f0f0f0" : "white" }}
                />

                <label><strong>부서명</strong></label>
                <input
                    name="deptName"
                    value={form.deptName}
                    onChange={handleChange}
                    placeholder="예: 개발팀"
                    style={{ padding: "8px" }}
                />

                <label><strong>부서 위치</strong></label>
                <input
                    name="deptLoc"
                    value={form.deptLoc}
                    onChange={handleChange}
                    placeholder="예: 서울 본사 3층"
                    style={{ padding: "8px" }}
                />

                <label><strong>상위 부서</strong></label>
                <select
                    name="parentDeptNo"
                    value={form.parentDeptNo}
                    onChange={handleChange}
                    style={{ padding: "8px" }}
                >
                    <option value="">최상위 부서 (없음)</option>
                    {allDepts
                        .filter(d => d.deptNo !== form.deptNo) // 자기 자신을 상위 부서로 선택 방지
                        .map(d => (
                            <option key={d.deptNo} value={d.deptNo}>
                                {"--".repeat(d.treeLevel)} {d.deptName}
                            </option>
                        ))
                    }
                </select>

                <label><strong>출력 순서 (왼쪽기준)</strong></label>
                <input
                    name="siblingOrder"
                    type="number"
                    value={form.siblingOrder}
                    onChange={handleChange}
                    placeholder="1부터 입력"
                    style={{ padding: "8px" }}
                />

                <label>현재 트리 레벨</label>
                <input
                    value={form.treeLevel}
                    readOnly
                    style={{ padding: "8px", backgroundColor: "#f9f9f9", border: "1px solid #ddd" }}
                />
            </div>

            <div style={{ marginTop: "40px", display: "flex", gap: "12px" }}>
                <button
                    onClick={handleSave}
                    style={{
                        padding: "10px 25px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        fontWeight: "bold",
                        cursor: "pointer"
                    }}
                >
                    {selectedDept.isNew ? "부서 등록" : "수정사항 저장"}
                </button>

                {!selectedDept.isNew && (
                    <button
                        onClick={handleDelete}
                        style={{
                            padding: "10px 25px",
                            backgroundColor: "#fff",
                            color: "#dc3545",
                            border: "1px solid #dc3545",
                            borderRadius: "4px",
                            cursor: "pointer"
                        }}
                    >
                        부서 삭제
                    </button>
                )}
            </div>
        </div>
    );
};

export default DeptDetail;