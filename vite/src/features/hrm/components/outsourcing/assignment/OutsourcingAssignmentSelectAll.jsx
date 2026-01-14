import {useEffect, useState} from "react";
import axios from "axios";

const OutsourcingAssignmentSelectAll = () => {
    const [deptList, setDeptList] = useState([]);

    useEffect(() => {
        handleClick();
    }, []);

    const handleClick = async () => {
        try {
            const res = await axios.get("/back/hyun/dept/selectAll",{
                withCredentials: true,
            });
            setDeptList(res.data);
            console.log("조회 결과 : ", res.data);
        } catch (e) {
            console.log("조회 실패 : ", e);
        }
    };

    return (
        <div>
            <h2>부서 목록</h2>
            {deptList && (
                <div>
                    <table border="1">
                        <thead>
                        <tr>
                            <th>부서 번호 </th>
                            <th>부서 이름 </th>
                            <th>부서 위치 </th>
                            <th>상위 부서번호 </th>
                            <th>트리 계층 </th>
                            <th>트리 순서</th>
                            <th>생성일시</th>
                            <th>수정일시</th>
                        </tr>
                        </thead>

                        <tbody>
                        {deptList.map((dept) => (
                            // key값과 필드명들을 DTO 이름과 동일하게 수정
                            <tr key={dept.id}>
                                <td>{dept.deptId}</td>
                                <td>{dept.deptName}</td>
                                <td>{dept.deptLoc}</td>
                                <td>{dept.parentDeptNo}</td>
                                <td>{dept.treeLevel}</td>
                                <td>{dept.siblingOrder}</td>
                                <td>{dept.createdAt}</td>
                                <td>{dept.updatedAt}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
            <button onClick={handleClick}>부서 전체 조회</button>
        </div>
    );
};

export default OutsourcingAssignmentSelectAll;