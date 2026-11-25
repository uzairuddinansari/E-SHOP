import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import axios from "axios";
import "../../public/stylesheets/Protected.css"

function ProtectedRoute(props) {
    const [auth, setAuth] = useState(null);

    useEffect(() => {
    axios.get(`http://localhost:3000/${props.route}`, {
        withCredentials: true
    })
    .then(() => setAuth(true))
    .catch((err) => {
        setAuth(false);
    });
}, [props.route]);

    if (auth === null) return  <div className="auth-loading">
            <div className="loader"></div>
            <p>Verifying Admin Access</p>
        </div>;

    return auth ? <Outlet /> : <Navigate to="/" replace />;
}

export default ProtectedRoute;