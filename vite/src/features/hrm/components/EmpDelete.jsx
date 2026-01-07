import {useState} from "react";
import axios from "axios";

const EmpDelete = () => {
    const [empList, setEmpList] = useState([]);

    const handleClick = async () => {
        try{
            const res = await axios("/back/hyun/emp/delete");
            console.log("삭제 성공")
        }catch(e){
            console.log("삭제 실패 : ",e)
        }
    }
    return(
        <div>
            <button onClick={handleClick}>사원 삭제</button>
        </div>
    )
}
export default EmpDelete;