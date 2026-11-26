import { useEffect, useLayoutEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import gsap from "gsap";
import "../../public/stylesheets/Signup.css";

/* ---- change these two to match your brand / image ---- */
const BRAND = "BASTA";
const HERO_IMAGE =
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D";

const API = import.meta.env.VITE_API_URL;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const prefersReduced = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* 24-point star used for the spinning badge */
const STAR_POINTS = Array.from({ length: 24 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 24;
    const r = i % 2 ? 42 : 50;
    return `${(50 + r * Math.cos(a)).toFixed(1)},${(50 + r * Math.sin(a)).toFixed(1)}`;
}).join(" ");

/* ---- password strength ---- */
const LEVELS = [
    { label: "", color: "#E2DEF0" },
    { label: "Weak", color: "#FF5C6C" },
    { label: "Okay", color: "#FFB020" },
    { label: "Good", color: "#8BD450" },
    { label: "Strong", color: "#2FC795" },
];

function getStrength(pw) {
    if (!pw) return { score: 0, label: "" };
    if (pw.length < 6) return { score: 1, label: "Too short" };

    let s = 0;
    if (pw.length >= 8) s++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
    if (/\d/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;

    const score = Math.max(1, s);
    return { score, label: LEVELS[score].label };
}

/* ---- small pieces ---- */
function LogoMark({ className }) {
    return (
        <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <rect x="1" y="1" width="38" height="38" rx="11" className="su-logo-bg" />
            <path
                className="su-logo-path"
                pathLength="1"
                d="M12 15h16l-1.4 14a2 2 0 0 1-2 1.8H15.4a2 2 0 0 1-2-1.8L12 15Z"
                stroke="#fff"
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <path
                className="su-logo-path"
                pathLength="1"
                d="M16 15v-2a4 4 0 0 1 8 0v2"
                stroke="#FFB020"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

/* message that slides open when it appears */
function Hint({ children, className = "su-hint", ...rest }) {
    const ref = useRef(null);

    useLayoutEffect(() => {
        if (prefersReduced()) return;
        const tween = gsap.fromTo(
            ref.current,
            { height: 0, opacity: 0, y: -4 },
            { height: "auto", opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }
        );
        return () => tween.kill();
    }, []);

    return (
        <p ref={ref} className={className} {...rest}>
            {children}
        </p>
    );
}

const Signup = () => {
    const navigate = useNavigate();
    const rootRef = useRef(null);
    const formRef = useRef(null);
    const mounted = useRef(true);

    const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
    const [fieldErrors, setFieldErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [imgOk, setImgOk] = useState(true);

    const strength = getStrength(formData.password);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    /* ---------- intro, floating loops, mouse parallax ---------- */
    useLayoutEffect(() => {
        if (prefersReduced()) return;

        let cleanupParallax = () => {};

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            tl.fromTo(
                ".su-visual",
                { clipPath: "inset(0 0 0 100%)" },
                {
                    clipPath: "inset(0 0 0 0%)",
                    duration: 1.1,
                    ease: "power4.inOut",
                    clearProps: "clipPath",
                }
            )
                .from(".su-logo-path", { strokeDashoffset: 1, duration: 0.9, ease: "power2.inOut", stagger: 0.15 }, 0.2)
                .from(".su-brand-name", { x: -10, opacity: 0, duration: 0.6 }, 0.5)
                .from(".su-line > span", { yPercent: 110, duration: 0.9, stagger: 0.08 }, 0.35)
                .from(".su-sub", { y: 14, opacity: 0, duration: 0.6 }, 0.7)
                .from(".su-field, .su-submit, .su-alt", { y: 22, opacity: 0, duration: 0.6, stagger: 0.08 }, 0.75)
                .from(".su-arch", { yPercent: 8, opacity: 0, duration: 1.1 }, 0.4)
                .from(".su-arch img", { scale: 1.25, duration: 1.6, ease: "power2.out" }, 0.4)
                .from(".su-echo", { scale: 0.9, opacity: 0, duration: 1 }, 0.6)
                .from(".su-chip", { scale: 0, opacity: 0, rotation: -12, duration: 0.7, ease: "back.out(2)", stagger: 0.12 }, 1)
                .from(".su-badge", { scale: 0, rotation: -90, duration: 0.9, ease: "back.out(1.6)" }, 1.2)
                .from(".su-visual-copy > *", { y: 20, opacity: 0, duration: 0.7, stagger: 0.1 }, 1.1);

            /* gentle floating chips (start after the intro pop) */
            gsap.utils.toArray(".su-chip").forEach((el, i) => {
                gsap.to(el, {
                    y: i % 2 ? -12 : 12,
                    rotation: i % 2 ? 3 : -3,
                    duration: 2.4 + i * 0.5,
                    ease: "sine.inOut",
                    yoyo: true,
                    repeat: -1,
                    delay: 2.4,
                });
            });

            /* slow spinning star badge */
            gsap.to(".su-badge-star", { rotation: 360, duration: 20, ease: "none", repeat: -1, transformOrigin: "50% 50%" });

            /* mouse parallax (desktop with a mouse only) */
            const canHover = window.matchMedia("(hover: hover) and (min-width: 901px)").matches;
            const visual = rootRef.current.querySelector(".su-visual");

            if (canHover && visual) {
                const layers = gsap.utils.toArray(".su-layer");
                const xTo = layers.map((el) => gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" }));
                const yTo = layers.map((el) => gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" }));

                const onMove = (e) => {
                    const r = visual.getBoundingClientRect();
                    const nx = (e.clientX - r.left) / r.width - 0.5;
                    const ny = (e.clientY - r.top) / r.height - 0.5;
                    layers.forEach((el, i) => {
                        const d = Number(el.dataset.depth) || 0;
                        xTo[i](nx * d);
                        yTo[i](ny * d);
                    });
                };
                const onLeave = () => {
                    layers.forEach((_, i) => {
                        xTo[i](0);
                        yTo[i](0);
                    });
                };

                visual.addEventListener("mousemove", onMove);
                visual.addEventListener("mouseleave", onLeave);
                cleanupParallax = () => {
                    visual.removeEventListener("mousemove", onMove);
                    visual.removeEventListener("mouseleave", onLeave);
                };
            }
        }, rootRef);

        return () => {
            cleanupParallax();
            ctx.revert();
        };
    }, []);

    /* ---------- strength bars ---------- */
    useEffect(() => {
        const bars = rootRef.current?.querySelectorAll(".su-bar i");
        if (!bars) return;

        const color = LEVELS[strength.score].color;
        bars.forEach((bar, i) => {
            gsap.to(bar, {
                scaleX: i < strength.score ? 1 : 0,
                backgroundColor: color,
                duration: prefersReduced() ? 0 : 0.35,
                ease: "power2.out",
                overwrite: true,
            });
        });
    }, [strength.score]);

    /* ---------- handlers ---------- */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setFieldErrors((prev) => ({ ...prev, [name]: "" }));
        setServerError("");
    };

    const shake = () => {
        if (prefersReduced() || !formRef.current) return;
        gsap.to(formRef.current, {
            keyframes: { x: [-10, 10, -6, 6, 0], easeEach: "power1.inOut" },
            duration: 0.4,
        });
    };

    const validate = () => {
        const errors = {};
        if (formData.fullName.trim().length < 3) errors.fullName = "Enter your full name (at least 3 letters).";
        if (!EMAIL_RE.test(formData.email.trim())) errors.email = "Enter a valid email like name@example.com.";
        if (formData.password.length < 6) errors.password = "Use at least 6 characters.";
        return errors;
    };

    const playSuccess = () => {
        const go = () => mounted.current && navigate("/");

        if (prefersReduced()) {
            setTimeout(go, 600);
            return;
        }

        const q = gsap.utils.selector(rootRef);
        gsap.timeline({ onComplete: go })
            .to(q(".su-submit"), { scale: 0.96, duration: 0.1 })
            .to(q(".su-submit"), { scale: 1, duration: 0.35, ease: "back.out(3)" })
            .to(q(".su-chip"), { scale: 1.25, duration: 0.25, stagger: 0.06, yoyo: true, repeat: 1, ease: "power2.out" }, "<")
            .to(q(".su-card"), { y: -18, opacity: 0, duration: 0.45, ease: "power2.in" }, "+=0.35");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading || done) return;

        const errors = validate();
        setFieldErrors(errors);
        if (Object.keys(errors).length) {
            shake();
            return;
        }

        setLoading(true);
        setServerError("");

        try {
            const response = await axios.post(
                `${API}/users/create`,
                {
                    fullName: formData.fullName.trim(),
                    email: formData.email.trim(),
                    password: formData.password,
                },
                { withCredentials: true }
            );

            toast.success(typeof response.data === "string" ? response.data : "Account created");
            setDone(true);
            playSuccess();
        } catch (err) {
            const data = err.response?.data;
            setServerError(
                (typeof data === "string" && data) || data?.message || "Something went wrong. Please try again."
            );
            shake();
        } finally {
            setLoading(false);
        }
    };

    /* ---------- UI ---------- */
    return (
        <main className="su" ref={rootRef}>
            {/* ===== form side ===== */}
            <section className="su-form-side">
                <header className="su-top">
                    <LogoMark className="su-logo" />
                    <span className="su-brand-name">{BRAND}</span>
                </header>

                <div className="su-main">
                    <div className="su-card">
                        <h1 className="su-title">
                            <span className="su-line">
                                <span>Create your</span>
                            </span>
                            <span className="su-line">
                                <span>account.</span>
                            </span>
                        </h1>
                        <p className="su-sub">Save your favourites and check out faster next time.</p>

                        <form ref={formRef} className="su-form" onSubmit={handleSubmit} noValidate>
                            <div className="su-field">
                                <label htmlFor="su-name">Full name</label>
                                <input
                                    id="su-name"
                                    type="text"
                                    name="fullName"
                                    placeholder="Your full name"
                                    autoComplete="name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    aria-invalid={!!fieldErrors.fullName}
                                />
                                {fieldErrors.fullName && <Hint>{fieldErrors.fullName}</Hint>}
                            </div>

                            <div className="su-field">
                                <label htmlFor="su-email">Email</label>
                                <input
                                    id="su-email"
                                    type="email"
                                    name="email"
                                    placeholder="name@example.com"
                                    autoComplete="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    aria-invalid={!!fieldErrors.email}
                                />
                                {fieldErrors.email && <Hint>{fieldErrors.email}</Hint>}
                            </div>

                            <div className="su-field">
                                <label htmlFor="su-password">Password</label>
                                <div className="su-password">
                                    <input
                                        id="su-password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="At least 6 characters"
                                        autoComplete="new-password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        aria-invalid={!!fieldErrors.password}
                                    />
                                    <button
                                        type="button"
                                        className="su-toggle"
                                        onClick={() => setShowPassword((s) => !s)}
                                        aria-pressed={showPassword}
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>

                                <div className="su-meter" aria-live="polite">
                                    <div className="su-bars" aria-hidden="true">
                                        {[0, 1, 2, 3].map((i) => (
                                            <span className="su-bar" key={i}>
                                                <i />
                                            </span>
                                        ))}
                                    </div>
                                    <span className="su-meter-label">{strength.label}</span>
                                </div>

                                {fieldErrors.password && <Hint>{fieldErrors.password}</Hint>}
                            </div>

                            {serverError && (
                                <Hint className="su-server-error" role="alert">
                                    {serverError}
                                </Hint>
                            )}

                            <button
                                className={`su-submit ${done ? "is-done" : ""}`}
                                type="submit"
                                disabled={loading || done}
                            >
                                {loading && <span className="su-spin" aria-hidden="true" />}
                                <span>
                                    {done ? "Account created" : loading ? "Creating account…" : "Create account"}
                                </span>
                            </button>
                        </form>

                        <Link className="su-alt" to="/">
                            I already have an account
                        </Link>
                    </div>
                </div>

                <footer className="su-foot">© 2026 {BRAND}</footer>
            </section>

            {/* ===== visual side ===== */}
            <aside className="su-visual" aria-hidden="true">
                <div className="su-glow su-glow-a" />
                <div className="su-glow su-glow-b" />

                <div className="su-stage">
                    <div className="su-layer su-layer-arch" data-depth="16">
                        <div className="su-echo" />
                        <div className="su-arch">
                            {imgOk && (
                                <img src={HERO_IMAGE} alt="" onError={() => setImgOk(false)} />
                            )}
                        </div>
                    </div>

                    <div className="su-layer su-pos su-pos-a" data-depth="38">
                        <div className="su-chip">
                            <i style={{ background: "#6247F5" }} />
                            <span>
                                <small>Violet</small>
                                #6247F5
                            </span>
                        </div>
                    </div>

                    <div className="su-layer su-pos su-pos-b" data-depth="-28">
                        <div className="su-chip">
                            <i style={{ background: "#FFB020" }} />
                            <span>
                                <small>Mango</small>
                                #FFB020
                            </span>
                        </div>
                    </div>

                    <div className="su-layer su-pos su-pos-c" data-depth="24">
                        <div className="su-chip">
                            <i style={{ background: "#3DD6A5" }} />
                            <span>
                                <small>Mint</small>
                                #3DD6A5
                            </span>
                        </div>
                    </div>

                    <div className="su-layer su-pos su-pos-badge" data-depth="-20">
                        <div className="su-badge">
                            <svg className="su-badge-star" viewBox="0 0 100 100">
                                <polygon points={STAR_POINTS} />
                            </svg>
                            <span>
                                new in
                                <br />
                                store
                            </span>
                        </div>
                    </div>
                </div>

                <div className="su-visual-copy">
                    <h2>Pick the colours you love.</h2>
                    <p>Every product comes in its own palette. Create an account and make the store yours.</p>
                </div>
            </aside>
        </main>
    );
};

export default Signup;