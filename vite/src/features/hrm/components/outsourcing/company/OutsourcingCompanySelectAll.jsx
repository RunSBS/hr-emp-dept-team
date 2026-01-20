import {useEffect, useState} from "react";
import axios from "axios";

const OutsourcingCompanySelectAll = () => {
    const [companyList, setCompanyList] = useState([]);

    useEffect(() => {
        handleClick();
    }, []);

    const handleClick = async () => {
        try {
            const res = await axios.get("/back/hyun/outsourcing/selectAllCompany",{
                withCredentials: true,
            });
            setCompanyList(res.data);
            console.log("조회 결과 : ", res.data);
        } catch (e) {
            console.log("조회 실패 : ", e);
        }
    };

    return (
        <div>
            <h2>파견업체목록</h2>
            {companyList && (
                <div>
                    <table border="1">
                        <thead>
                        <tr>
                            <th>업체ID</th>
                            <th>업체명</th>
                            <th>생성일시</th>
                            <th>수정일시</th>
                        </tr>
                        </thead>

                        <tbody>
                        {companyList.map((company) => (
                            // key값과 필드명들을 DTO 이름과 동일하게 수정
                            <tr key={company.id}>
                                <td>{company.companyId}</td>
                                <td>{company.companyName}</td>
                                <td>{company.createdAt}</td>
                                <td>{company.updatedAt}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
            <button onClick={handleClick}>파견업체 전체 조회</button>
        </div>
    );
};

export default OutsourcingCompanySelectAll;