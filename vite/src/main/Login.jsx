import { useNavigate } from "react-router-dom";
//로그인 과정: 관리자 회원가입->관리자 로그인->사원기본정보생성->사원초대->사원메일등록->승인완료
const Login = () => {
    const navigate = useNavigate();

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
            <button>파이썬 응답예시</button>
        </>
    );
};

export default Login;
