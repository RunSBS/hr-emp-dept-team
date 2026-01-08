import EmpSelectAll from "../components/EmpSelectAll.jsx";
import {useState} from "react";
import EmpInsert from "../components/EmpInsert.jsx";
import EmpUpdate from "../components/EmpUpdate.jsx";
import EmpDelete from "../components/EmpDelete.jsx";

const Emp = () => {
    const [page, setPage] = useState("empSelectAll");
    return(
        <>
            {page === "empSelectAll" && <EmpSelectAll/>}
            {page === "empInsert" && <EmpInsert/>}
            {page === "empUpdate" && <EmpUpdate/>}
            {page === "empDelete" && <EmpDelete/>}
            <div>
                <button onClick={()=>{
                    setPage("empSelectAll");
                }}>사원 조회</button>
                <button onClick={()=>{
                    setPage("empInsert");
                }}>사원 등록</button>
                <button onClick={()=>{
                    setPage("empUpdate");
                }}>사원 수정</button>
                <button onClick={()=>{
                    setPage("empDelete");
                }}>사원 삭제</button>
            </div>
        </>
    )
}
export default Emp;