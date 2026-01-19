import { useEffect, useState } from "react";
import axios from "axios";

const DeptList = ({ onSelectDept, refreshTrigger }) => {
    const [rawList, setRawList] = useState([]);

    useEffect(() => {
        axios.get("/back/hyun/dept/selectAll", { withCredentials: true })
            .then(res => setRawList(res.data))
            .catch(err => console.error("조회 실패", err));
    }, [refreshTrigger]); // 성공 시 리스트 갱신을 위한 트리거 추가

    const buildTree = (list) => {
        const map = {};
        const tree = [];
        const sortedList = [...list].sort((a, b) => (a.siblingOrder || 0) - (b.siblingOrder || 0));

        sortedList.forEach(dept => { map[dept.deptNo] = { ...dept, children: [] }; });
        sortedList.forEach(dept => {
            const currentDept = map[dept.deptNo];
            if (dept.parentDeptNo && map[dept.parentDeptNo]) {
                map[dept.parentDeptNo].children.push(currentDept);
            } else { tree.push(currentDept); }
        });
        return tree;
    };

    const renderNodes = (nodes) => (
        <ul className="ps-3 mt-1" style={{ listStyle: "none" }}>
            {nodes.map(node => (
                <li key={node.deptNo} className="mb-1">
                    <div className="d-flex align-items-center justify-content-between p-2 rounded border-bottom-hover bg-white"
                         style={{ cursor: "pointer", border: "1px solid #f0f0f0" }}
                         onClick={() => onSelectDept(node)}>
                        <div className="d-flex align-items-center gap-2">
                            <span>{node.children.length > 0 ? "📂" : "📄"}</span>
                            <span className="fw-medium">{node.deptName}</span>
                            <small className="text-muted" style={{fontSize: '10px'}}>#{node.deptNo}</small>
                        </div>
                        <i className="bi bi-chevron-right text-muted small"></i>
                    </div>
                    {node.children.length > 0 && renderNodes(node.children)}
                </li>
            ))}
        </ul>
    );

    return (
        <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h6 className="mb-0 fw-bold"><i className="bi bi-diagram-3 me-2"></i>조직도 현황</h6>
                <button className="btn btn-xs btn-outline-primary" onClick={() => onSelectDept({ isNew: true })}>
                    <i className="bi bi-plus-lg"></i> 추가
                </button>
            </div>
            <div className="card-body overflow-auto" style={{ maxHeight: "70vh" }}>
                {rawList.length > 0 ? renderNodes(buildTree(rawList)) : (
                    <div className="text-center py-5 text-muted small">등록된 부서가 없습니다.</div>
                )}
            </div>
        </div>
    );
};

export default DeptList;