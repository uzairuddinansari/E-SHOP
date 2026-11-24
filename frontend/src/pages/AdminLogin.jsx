import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../public/stylesheets/AdminLogin.css";

const AdminLogin = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await axios.post(
                "http://localhost:3000/owners/login",
                form,
                { withCredentials: true }
            );

            navigate("/AdminPanel");

        } catch (err) {
            setError(
                err.response?.data?.message || "Login failed. Try again."
            );
        } finally {
            setLoading(false);
        }
    };

   return (
    <div id="admin-login-page">
        <div id="admin-login-card">
            <div id="admin-login-header">
                <span id="admin-login-tag">ADMIN PORTAL</span>
                <h1>Welcome Back.</h1>
                <p>Enter your credentials to access your dashboard.</p>
            </div>

            <form id="admin-login-form" onSubmit={handleLogin}>
                <div className="admin-login-field">
                    <label htmlFor="admin-email">Email Address</label>
                    <input
                        id="admin-email"
                        type="email"
                        name="email"
                        placeholder="admin@example.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="admin-login-field">
                    <label htmlFor="admin-password">Password</label>
                    <input
                        id="admin-password"
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                {error && <p id="admin-login-error">{error}</p>}

                <button id="admin-login-submit" type="submit" disabled={loading}>
                    {loading ? "Authenticating..." : "Sign In →"}
                </button>
            </form>

            <p id="admin-login-footer">SECURE ADMIN ACCESS © 2026</p>
        </div>
    </div>
);
};

export default AdminLogin;
