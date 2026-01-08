import {useState} from "react";

const EmpUpdate = () => {
    const [empList, setEmpList] = useState([]);

    const handleClick = async () => {
        try{

        }catch(e){
            console.log("수정 실패 : ",e)
        }
    }
    return(
        <div>
            <button onClick={handleClick}>사원 수정</button>
        </div>
    )
}
export default EmpUpdate;