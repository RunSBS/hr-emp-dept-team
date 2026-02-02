import { Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Select = () => {
    const navigate = useNavigate();
    const [types, setTypes] = useState([]);

    useEffect(() => {
        fetch("/back/ho/approvals/type", {
            credentials: "include"
        })
            .then(res => res.json())
            .then(setTypes)
            .catch(console.error);
    }, []);

    if (types.length === 0) {
        return <div>결재 유형을 불러오는 중...</div>;
    }

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 20
            }}
        >
            {types.map(type => (
                <Card
                    key={type.typeId}
                    style={{ cursor: "pointer", padding: 20, transition: "all 0.2s ease" }}
                    onClick={() =>
                        navigate(`/main/approval/request/${type.typeId}`, {
                            state: { type } // type 객체 전체 전달
                        })
                    }
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.12)";
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = "none";
                        e.currentTarget.style.boxShadow = "none";
                    }}
                >
                    <Card.Body>
                        <h5>{type.typeName}</h5>
                        <p style={{ color: "#666" }}>{type.description}</p>
                    </Card.Body>
                </Card>

            ))}
        </div>
    );
};

export default Select;