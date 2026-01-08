import { useEffect, useState } from "react";
import axios from "axios";

const Record = () => {
    const [invite, setInvite] = useState([]);

    useEffect(() => {
        const fetchInvite = async () => {
            try {
                const res = await axios.get("/back/invite");
                setInvite(res.data);
            } catch (e) {
                console.error(e);
            }
        };

        fetchInvite();
    }, []);

    return (
        <>
            <h1>초대 기록</h1>

            <table border="1">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>사원ID</th>
                    <th>이메일</th>
                    <th>상태</th>
                    <th>생성일</th>
                    <th>완료일</th>
                </tr>
                </thead>

                <tbody>
                {invite.map((i) => (
                    <tr key={i.id}>
                        <td>{i.id}</td>
                        <td>{i.empId}</td>
                        <td>{i.email}</td>
                        <td>{i.status}</td>
                        <td>{i.createdAt}</td>
                        <td>{i.completedAt ?? "-"}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </>
    );
};

export default Record;
