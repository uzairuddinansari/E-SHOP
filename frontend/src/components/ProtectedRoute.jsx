import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import axios from "axios";

function ProtectedRoute(props) {
    const [auth, setAuth] = useState(null);

    useEffect(() => {
    axios.get(`http://localhost:3000/${props.route}`, {
        withCredentials: true
    })
    .then(() => setAuth(true))
    .catch((err) => {
        console.log("STATUS:", err.response?.status);
        console.log("ERROR:", err.response?.data);
        setAuth(false);
    });
}, [props.route]);

    if (auth === null) return <h2>Loading...</h2>;

    return auth ? <Outlet /> : <Navigate to="/" replace />;
}

export default ProtectedRoute;