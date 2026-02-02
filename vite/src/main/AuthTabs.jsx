import { NavLink } from "react-router-dom";

const AuthTabs = () => {
    return (
        <div className="top-btn-group">
            <NavLink
                to="/"
                end
                className={({ isActive }) =>
                    isActive ? "tab-btn active" : "tab-btn"
                }
            >
                로그인
            </NavLink>

            <NavLink
                to="/sign"
                className={({ isActive }) =>
                    isActive ? "tab-btn active" : "tab-btn"
                }
            >
                관리자 가입
            </NavLink>

            <NavLink
                to="/empsign"
                className={({ isActive }) =>
                    isActive ? "tab-btn active" : "tab-btn"
                }
            >
                사원 가입
            </NavLink>
        </div>
    );
};

export default AuthTabs;
