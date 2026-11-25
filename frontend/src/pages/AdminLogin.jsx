import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../../public/stylesheets/AdminLogin.css";

const HERO_IMAGE =
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D";

const AdminLogin = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
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
            await axios.post("http://localhost:3000/owners/login", form, {
                withCredentials: true,
            });

            navigate("/AdminPanel");
        } catch (err) {
            setError(
                err.response?.data?.message || "Login failed. Check your details and try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="al">
            {/* ---------- image side ---------- */}
            <aside className="al-visual">
                <img src={HERO_IMAGE} alt="" />
                <div className="al-visual-shade" />

                <div className="al-visual-brand">Shop admin</div>

                <div className="al-visual-copy">
                    <h2>Your whole catalogue, one calm place.</h2>
                    <p>Add products, set prices and discounts, and pick the colours for each item.</p>
                </div>
            </aside>

            {/* ---------- form side ---------- */}
            <section className="al-form-side">
                <div className="al-card">
                    <header className="al-head">
                        <h1>Sign in</h1>
                        <p>Use your admin account to manage the store.</p>
                    </header>

                    <form className="al-form" onSubmit={handleLogin}>
                        <div className="al-field">
                            <label htmlFor="admin-email">Email</label>
                            <input
                                id="admin-email"
                                type="email"
                                name="email"
                                placeholder="admin@example.com"
                                autoComplete="username"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="al-field">
                            <label htmlFor="admin-password">Password</label>
                            <div className="al-password">
                                <input
                                    id="admin-password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="al-toggle"
                                    onClick={() => setShowPassword((s) => !s)}
                                    aria-pressed={showPassword}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <p className="al-error" role="alert">
                                {error}
                            </p>
                        )}

                        <button className="al-submit" type="submit" disabled={loading}>
                            {loading ? "Signing in…" : "Sign in"}
                        </button>
                    </form>

                    <p className="al-foot">
                        Not an admin? <Link to="/">Go to customer login</Link>
                    </p>
                </div>
            </section>
        </main>
    );
};

export default AdminLogin;