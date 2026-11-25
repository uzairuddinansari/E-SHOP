import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import axios from "axios";
import "../../public/stylesheets/Protected.css"

function GuestRoute() {
    const [auth, setAuth] = useState(null);

    useEffect(() => {
        axios.get("http://localhost:3000/users/check-auth", {
            withCredentials: true
        })
        .then(() => setAuth(true))
        .catch(() => setAuth(false));
    }, []);

    if (auth === null) return  <div className="auth-loading">
            <div className="loader"></div>
            <p>Verifying Admin Access</p>
        </div>;

    return auth ? <Navigate to="/Profile" replace /> : <Outlet />;
}

export default GuestRoute;