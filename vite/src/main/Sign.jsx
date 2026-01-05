import { useNavigate } from "react-router-dom";

const Sign=()=>{
    const navigate = useNavigate();
    return(
        <>
            <div style={{display:"flex"}}>
                <h1 onClick={() => navigate("/")}>로그인</h1>
                &nbsp;
                <h1 onClick={() => navigate("/sign")}>회원가입</h1>
            </div>
            회원가입
            email:<input type="text"/>
            pwd:<input type="password"/>
            <button>회원가입</button>
            <p></p>
        </>
    )
}
export default Sign;