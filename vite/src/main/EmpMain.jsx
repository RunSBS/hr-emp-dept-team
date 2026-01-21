import axios from "axios";

const EmpMain = () => {
    return(
        <>
            <button onClick={()=>{
                const res = axios.get('/ai/hyun/search/predict')
                console.log(res);
            }}>
                플라스크 요청 테스트
            </button>
        </>
    )
}
export default EmpMain;