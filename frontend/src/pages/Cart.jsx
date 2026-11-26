import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import gsap from "gsap";
import "../../public/stylesheets/Cart.css";

const API = import.meta.env.VITE_API_URL;
const BRAND = "Basta"; // apne brand ka naam yahan likho

/* ---------- chhote helpers ---------- */
const money = (n) => Number(n).toLocaleString("en-PK");

// discount lagne ke baad ek piece ki asli price
const finalPrice = (item) =>
    Math.round(item.price - (item.price * (item.discount || 0)) / 100);

const prefersReduced = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- logo + icon ---------- */
function LogoMark() {
    return (
        <svg className="cp-logo" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <rect x="1" y="1" width="38" height="38" rx="11" className="cp-logo-bg" />
            <path
                d="M12 15h16l-1.4 14a2 2 0 0 1-2 1.8H15.4a2 2 0 0 1-2-1.8L12 15Z"
                stroke="#fff"
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <path
                d="M16 15v-2a4 4 0 0 1 8 0v2"
                stroke="#FFB020"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

function TrashIcon() {
    return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 7h16" />
            <path d="M10 11v6M14 11v6" />
            <path d="M6 7l1 12a2 2 0 0 0 2 1.8h6a2 2 0 0 0 2-1.8L18 7" />
            <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
    );
}

const Cart = () => {
    const pageRef = useRef(null);

    const [added, setAdded] = useState([]); // server se aayi list (duplicates ke saath)
    const [status, setStatus] = useState("loading"); // loading | ready | error
    const [removingId, setRemovingId] = useState(null);

    /* 1) Cart server se lao */
    const loadCart = async () => {
        setStatus("loading");
        try {
            const res = await axios.get(`${API}/cart`, { withCredentials: true });
            setAdded(Array.isArray(res.data) ? res.data : []);
            setStatus("ready");
        } catch (err) {
            
            setStatus("error");
        }
    };

    useEffect(() => {
        loadCart();
    }, []);

    /* 2) Ek hi product kai baar add hua ho to ek row banao aur qty gino */
    const rows = useMemo(() => {
        const map = new Map();
        added.forEach((item) => {
            if (map.has(item._id)) map.get(item._id).qty += 1;
            else map.set(item._id, { ...item, qty: 1 });
        });
        return [...map.values()];
    }, [added]);

    /* 3) Totals */
    const totals = useMemo(() => {
        let subtotal = 0;
        let total = 0;
        rows.forEach((item) => {
            subtotal += item.price * item.qty;
            total += finalPrice(item) * item.qty;
        });
        return { subtotal, saved: subtotal - total, total };
    }, [rows]);

    /* 4) Page khulte hi rows ek ek karke aati hain */
    useEffect(() => {
        if (status !== "ready" || prefersReduced()) return;

        const ctx = gsap.context(() => {
            gsap.from(".cp-row", {
                y: 24,
                opacity: 0,
                duration: 0.5,
                stagger: 0.07,
                ease: "power3.out",
            });
            gsap.from(".cp-summary", { y: 24, opacity: 0, duration: 0.6, ease: "power3.out" });
        }, pageRef);

        return () => ctx.revert();
    }, [status]);

    /* 5) Delete: server se hatao, phir row ko animation ke saath nikalo */
    const removeItem = async (item) => {
        if (removingId) return;
        setRemovingId(item._id);

        try {
            await axios.delete(`${API}/cart/${item._id}`, { withCredentials: true });

            const row = pageRef.current?.querySelector(`[data-id="${item._id}"]`);
            if (row && !prefersReduced()) {
                await new Promise((resolve) =>
                    gsap.to(row, { opacity: 0, x: 40, duration: 0.3, ease: "power2.in", onComplete: resolve })
                );
            }

            setAdded((prev) => prev.filter((p) => p._id !== item._id));
            toast.success(`${item.name} removed from bag`);
        } catch (err) {
            const msg = err.response?.data;
            toast.error(typeof msg === "string" && msg ? msg : "Failed to remove product");
        } finally {
            setRemovingId(null);
        }
    };

    const itemCount = added.length;

    /* ---------- UI ---------- */
    return (
        <div className="cp" ref={pageRef}>
            <header className="cp-nav">
                <Link to="/Profile" className="cp-brand">
                    <LogoMark />
                    <span>{BRAND}</span>
                </Link>
                <Link to="/Profile" className="cp-back">
                    Continue shopping
                </Link>
            </header>

            <main className="cp-main">
                <div className="cp-title">
                    <h1>Your bag</h1>
                    {status === "ready" && itemCount > 0 && (
                        <p>
                            {itemCount} {itemCount === 1 ? "item" : "items"}
                        </p>
                    )}
                </div>

                {status === "loading" && (
                    <div className="cp-card" aria-busy="true">
                        {[0, 1, 2].map((i) => (
                            <div className="cp-skel" key={i}>
                                <div className="cp-skel-box" />
                                <div className="cp-skel-line" />
                            </div>
                        ))}
                    </div>
                )}

                {status === "error" && (
                    <div className="cp-state">
                        <h2>Couldn't load your bag</h2>
                        <p>Check your connection and try again.</p>
                        <button className="cp-primary" onClick={loadCart}>
                            Try again
                        </button>
                    </div>
                )}

                {status === "ready" && rows.length === 0 && (
                    <div className="cp-state">
                        <h2>Your bag is empty</h2>
                        <p>Add something you like from the shop.</p>
                        <Link className="cp-primary" to="/Profile">
                            Back to shop
                        </Link>
                    </div>
                )}

                {status === "ready" && rows.length > 0 && (
                    <div className="cp-layout">
                        {/* ===== items, ek row me ek product ===== */}
                        <section className="cp-card">
                            <div className="cp-head" aria-hidden="true">
                                <span className="cp-h-product">Product</span>
                                <span>Price</span>
                                <span>Discount</span>
                                <span>Qty</span>
                                <span className="cp-h-total">Total</span>
                                <span />
                            </div>

                            <ul className="cp-list">
                                {rows.map((item) => (
                                    <li className="cp-row" key={item._id} data-id={item._id}>
                                        <div
                                            className="cp-thumb"
                                            style={{ backgroundColor: item.bgColor || "#F3F0FF" }}
                                        >
                                            <img
                                                src={`data:image/jpeg;base64,${item.image}`}
                                                alt={item.name}
                                            />
                                        </div>

                                        <h3 className="cp-name">{item.name}</h3>

                                        <div className="cp-cell cp-c-price" data-label="Price">
                                            Rs. {money(item.price)}
                                        </div>

                                        <div className="cp-cell cp-c-disc" data-label="Discount">
                                            {item.discount > 0 ? (
                                                <span className="cp-badge">{item.discount}% off</span>
                                            ) : (
                                                <span className="cp-none">None</span>
                                            )}
                                        </div>

                                        <div className="cp-cell cp-c-qty" data-label="Qty">
                                            {item.qty}
                                        </div>

                                        <div className="cp-cell cp-c-total" data-label="Total">
                                            <strong>Rs. {money(finalPrice(item) * item.qty)}</strong>
                                        </div>

                                        <button
                                            className="cp-del"
                                            onClick={() => removeItem(item)}
                                            disabled={removingId === item._id}
                                            aria-label={`Remove ${item.name} from bag`}
                                            title="Remove"
                                        >
                                            <TrashIcon />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* ===== summary ===== */}
                        <aside className="cp-summary">
                            <h2>Order summary</h2>

                            <dl>
                                <div>
                                    <dt>Subtotal</dt>
                                    <dd>Rs. {money(totals.subtotal)}</dd>
                                </div>
                                <div>
                                    <dt>Discount</dt>
                                    <dd className="cp-save">
                                        {totals.saved > 0 ? `− Rs. ${money(totals.saved)}` : "Rs. 0"}
                                    </dd>
                                </div>
                                <div className="cp-sum-total">
                                    <dt>Total</dt>
                                    <dd>Rs. {money(totals.total)}</dd>
                                </div>
                            </dl>

                            <Link className="cp-primary" to="/Profile">
                                Continue shopping
                            </Link>
                        </aside>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Cart;