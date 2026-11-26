import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import axios from "axios";
import "../../public/stylesheets/Protected.css"

function ProtectedRoute(props) {
    const [auth, setAuth] = useState(null);

    useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}${props.route}`, {
        withCredentials: true
    })
    .then(() => setAuth(true))
    .catch((err) => {
        setAuth(false);
    });
}, [props.route]);

    if (auth === null) return  <div className="auth-loading">
            <div className="loader"></div>
            <p>Verifying Access</p>
        </div>;

    return auth ? <Outlet /> : <Navigate to={props.redirect} replace />;
}

export default ProtectedRoute;