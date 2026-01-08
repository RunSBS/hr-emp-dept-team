import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetch("/back/signup/me", { credentials: "include" })
            .then(res => res.json())
            .then(data => {
                if (data.authenticated) {
                    setUser(data);
                } else {
                    setUser(null);
                }
            })
            .catch(() => {
                setUser(null);
            });
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
