import { Routes, Route } from "react-router-dom";
import Singup from "./pages/Signup";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import { Toaster } from "react-hot-toast";
import Guestroute from "./components/Guestroute"
import AdminPanel from "./pages/AdminPanel";
import AdminLogin from "./pages/AdminLogin";
import Admincheck from "./components/Admincheck";

function App() {
    return (
        <>
            <Toaster position="top-right" />

            <Routes>
                 <Route element={<Guestroute />}>
                     <Route path="/" element={<Login />} />
                     <Route path="/Signup" element={<Singup />} />
                 </Route>

                <Route element={<ProtectedRoute route="users/check-auth" />}>
                    <Route path="/Profile" element={<Profile />} />
                </Route>

                <Route element={<ProtectedRoute route="owners/check/Admin"/>}>
                    <Route path="/AdminPanel" element={<AdminPanel />} />
                </Route>

                <Route element={<Admincheck />}>
                  <Route path="/login/Admin" element={<AdminLogin />} />
                </Route>
            </Routes>
        </>
    );
}

export default App;