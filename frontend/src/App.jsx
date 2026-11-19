import { Routes, Route } from "react-router-dom";
import Singup from "./pages/Signup";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import { Toaster } from "react-hot-toast";
import Guestroute from "./components/Guestroute"

function App() {
    return (
        <>
            <Toaster position="top-right" />

            <Routes>
                 <Route element={<Guestroute />}>
                     <Route path="/" element={<Login />} />
                     <Route path="/Signup" element={<Singup />} />
                 </Route>

                <Route element={<ProtectedRoute />}>
                    <Route path="/Profile" element={<Profile />} />
                </Route>
            </Routes>
        </>
    );
}

export default App;