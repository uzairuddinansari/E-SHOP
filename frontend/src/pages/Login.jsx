import { useLayoutEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import gsap from "gsap";
import { Link, useNavigate } from "react-router-dom";
import "../../public/stylesheets/Login.css";

const BRAND = "Basta"; // apne brand ka naam yahan likho
const API = import.meta.env.VITE_API_URL;

/* Server kabhi text bhejta hai, kabhi { message }. Dono se text nikalne ka chhota helper */
function getText(data, fallback) {
    if (typeof data === "string" && data) return data;
    if (data && data.message) return data.message;
    return fallback;
}

/* Logo (Signup page wala hi) */
function LogoMark() {
    return (
        <svg className="lg-logo" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <rect x="1" y="1" width="38" height="38" rx="11" className="lg-logo-bg" />
            <path
                className="lg-logo-path"
                pathLength="1"
                d="M12 15h16l-1.4 14a2 2 0 0 1-2 1.8H15.4a2 2 0 0 1-2-1.8L12 15Z"
                stroke="#fff"
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <path
                className="lg-logo-path"
                pathLength="1"
                d="M16 15v-2a4 4 0 0 1 8 0v2"
                stroke="#FFB020"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

const Login = () => {
    const navigate = useNavigate();

    // GSAP in dono elements ko pakadta hai
    const pageRef = useRef(null);
    const cardRef = useRef(null);

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    /* 1) Page khulte hi animation: card upar aata hai, logo draw hota hai, items ek ek karke aate hain */
    useLayoutEffect(() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduce) return; // jinko animation pasand nahi unke liye band

        const ctx = gsap.context(() => {
            gsap.timeline({ defaults: { ease: "power3.out" } })
                .from(".lg-card", { y: 40, opacity: 0, duration: 0.8 })
                .from(".lg-logo-path", { strokeDashoffset: 1, duration: 0.8, stagger: 0.15 }, 0.2)
                .from(".lg-item", { y: 18, opacity: 0, duration: 0.5, stagger: 0.08 }, 0.4);
        }, pageRef);

        return () => ctx.revert();
    }, []);

    /* 2) Galat login par card ko hilane wala effect */
    const shake = () => {
        gsap.to(cardRef.current, {
            keyframes: { x: [-10, 10, -6, 6, 0], easeEach: "power1.inOut" },
            duration: 0.4,
        });
    };

    /* 3) Input likhte waqt state update */
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    /* 4) Login button dabane par */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        setLoading(true);
        try {
            const res = await axios.post(`${API}/users/login`, formData, {
                withCredentials: true,
            });

            toast.success(getText(res.data, "Login successful"));
            navigate("/Profile"); // user aur admin dono yahin jate hain
        } catch (err) {
            toast.error(getText(err.response?.data, "Login failed. Try again."));
            shake();
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="lg" ref={pageRef}>
            <div className="lg-card" ref={cardRef}>
                <div className="lg-brand lg-item">
                    <LogoMark />
                    <span>{BRAND}</span>
                </div>

                <h1 className="lg-item">Welcome back</h1>
                <p className="lg-sub lg-item">Log in to see your favourites and keep shopping.</p>

                <form className="lg-form" onSubmit={handleSubmit}>
                    <div className="lg-field lg-item">
                        <label htmlFor="lg-email">Email</label>
                        <input
                            id="lg-email"
                            type="email"
                            name="email"
                            placeholder="name@example.com"
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="lg-field lg-item">
                        <label htmlFor="lg-password">Password</label>
                        <div className="lg-password">
                            <input
                                id="lg-password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <button
                                type="button"
                                className="lg-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    <button className="lg-submit lg-item" type="submit" disabled={loading}>
                        {loading && <span className="lg-spin" aria-hidden="true" />}
                        <span>{loading ? "Logging in…" : "Log in"}</span>
                    </button>
                </form>

                <p className="lg-switch lg-item">
                    New here? <Link to="/Signup">Create an account</Link>
                </p>
            </div>

            <p className="lg-admin">
                Store owner? <Link to="/Login/Admin">Admin login</Link>
            </p>
        </main>
    );
};

export default Login;