import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import axios from "axios";

function ProtectedRoute() {
    const [auth, setAuth] = useState(null);

    useEffect(() => {
        axios.get("http://localhost:3000/shop", {
            withCredentials: true
        })
        .then(() => setAuth(true))
        .catch(() => setAuth(false));
    }, []);

    if (auth === null) return <h2>Loading...</h2>;

    return auth ? <Outlet /> : <Navigate to="/" replace />;
}

export default ProtectedRoute;