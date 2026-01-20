import MeetingManage from "../components/MeetingManage.jsx";
import {useAuth} from "../../../main/AuthContext.jsx";

const Meeting = () => {
    const { user } = useAuth();
    if (!user) return <div>로그인 필요</div>;

    return (
        <>
            <MeetingManage />
        </>
    );
};


export default Meeting;
