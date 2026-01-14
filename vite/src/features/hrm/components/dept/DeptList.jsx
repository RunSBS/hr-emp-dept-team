import { useEffect, useState } from "react";
import axios from "axios";

const DeptList = ({ onSelectDept }) => {
    const [rawList, setRawList] = useState([]);

    useEffect(() => {
        // 부서 전체 목록 조회
        axios.get("/back/hyun/dept/selectAll", { withCredentials: true })
            .then(res => {
                setRawList(res.data);
                console.log("조회된 원본 데이터:", res.data);
            })
            .catch(err => console.error("조회 실패", err));
    }, []);

    // 트리 구조 생성 및 정렬 로직
    const buildTree = (list) => {
        const map = {};
        const tree = [];

        // 1. 전체 리스트를 siblingOrder 기준으로 먼저 정렬 (오름차순: 1, 2, 3...)
        const sortedList = [...list].sort((a, b) => (a.siblingOrder || 0) - (b.siblingOrder || 0));

        // 2. 객체 맵핑 (children 배열 추가)
        sortedList.forEach(dept => {
            map[dept.deptNo] = { ...dept, children: [] };
        });

        // 3. 부모-자식 관계 연결
        sortedList.forEach(dept => {
            const currentDept = map[dept.deptNo];
            if (dept.parentDeptNo && map[dept.parentDeptNo]) {
                map[dept.parentDeptNo].children.push(currentDept);
            } else {
                // 부모가 없으면 최상위 루트로 배치
                tree.push(currentDept);
            }
        });

        return tree;
    };

    // 재귀적으로 조직도 항목 렌더링
    const renderNodes = (nodes) => (
        <ul style={{ listStyle: "none", paddingLeft: "15px", margin: "5px 0" }}>
            {nodes.map(node => (
                <li key={node.deptNo} style={{ marginBottom: "5px" }}>
                    <div
                        onClick={() => onSelectDept(node)}
                        style={{
                            cursor: "pointer",
                            padding: "8px 12px",
                            borderRadius: "4px",
                            border: "1px solid #e0e0e0",
                            backgroundColor: "white",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            transition: "all 0.2s"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f0f7ff"}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = "white"}
                    >
                        {/* 폴더 아이콘 또는 계층 표시 */}
                        <span>{node.children.length > 0 ? "📂" : "📄"}</span>
                        <span style={{ fontWeight: "500" }}>{node.deptName}</span>
                        <span style={{ fontSize: "11px", color: "#999" }}>({node.siblingOrder})</span>
                    </div>
                    {/* 자식 부서가 있다면 재귀 호출 */}
                    {node.children.length > 0 && renderNodes(node.children)}
                </li>
            ))}
        </ul>
    );

    const treeData = buildTree(rawList);

    return (
        <div style={{ padding: "10px" }}>
            <h4 style={{ marginBottom: "15px", paddingLeft: "5px" }}>🏢 조직도 현황</h4>
            {treeData.length > 0 ? (
                renderNodes(treeData)
            ) : (
                <div style={{ fontSize: "12px", color: "#999", textAlign: "center", marginTop: "20px" }}>
                    등록된 부서가 없습니다.
                </div>
            )}
        </div>
    );
};

export default DeptList;