import { useNavigate } from "react-router-dom";
import axios from "axios"
//로그인 과정: 관리자 회원가입->관리자 로그인->사원기본정보생성->사원초대->사원메일등록->승인완료
const Login = () => {
    const navigate = useNavigate();

    const callPython = async () => {
        try {
            const res = await axios.get("/ai/young/chatbot/ask");
            console.log(res.data);
            alert(res.data);
        } catch (err) {
            console.error(err);
            alert("파이썬 서버 요청 실패");
        }
    };

    return (
        <>
            <div style={{display:"flex"}}>
                <h1 onClick={() => navigate("/")}>로그인</h1>
                &nbsp;
                <h1 onClick={() => navigate("/sign")}>회원가입</h1>
            </div>
            로그인
            email:<input type="text"/>
            pwd:<input type="text"/>
            <button>로그인</button>
            <p></p>
            <button onClick={callPython}>
                파이썬 응답예시
            </button>
            <form action="/back/hyun/test" method="get">
                스프링 테스트 :
                <input type="text" name="abc"/>
                <button type="submit">제출</button>
            </form>
        </>
    );
};

export default Login;
