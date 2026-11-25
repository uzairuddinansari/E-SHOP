import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";
import "../../public/stylesheets/ProfilePage.css";

gsap.registerPlugin(ScrollTrigger);

const BRAND = "Basta"; // apne brand ka naam yahan likho
const API = "http://localhost:3000";

const VIEWS = [
    { id: "all", label: "All products" },
    { id: "new", label: "New in" },
    { id: "sale", label: "On sale" },
];

const SORTS = [
    { id: "featured", label: "Featured" },
    { id: "low", label: "Price: low to high" },
    { id: "high", label: "Price: high to low" },
    { id: "discount", label: "Biggest discount" },
];

const prefersReduced = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- chhote helpers ---------- */
const money = (n) => Number(n).toLocaleString("en-PK");

// discount lagne ke baad asli price
const finalPrice = (item) =>
    Math.round(item.price - (item.price * (item.discount || 0)) / 100);

/* ---------- icons / logo ---------- */
function LogoMark() {
    return (
        <svg className="sp-logo" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <rect x="1" y="1" width="38" height="38" rx="11" className="sp-logo-bg" />
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

function BagIcon() {
    return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 8h14l-1.2 11a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z" />
            <path d="M9 8V7a3 3 0 0 1 6 0v1" />
        </svg>
    );
}

/* ---------- ek product ka card ---------- */
function ProductCard({ item }) {
    const hasDiscount = item.discount > 0;

    return (
        <article className="sp-card">
            {/* image wala hissa: admin ka chuna hua bgColor */}
            <div className="sp-card-image" style={{ backgroundColor: item.bgColor || "#F3F0FF" }}>
                <img
                    src={`data:image/jpeg;base64,${item.image}`}
                    alt={item.name}
                    loading="lazy"
                />

                {hasDiscount && <span className="sp-badge">{item.discount}% off</span>}

                <button
                    className="sp-add"
                    aria-label={`Add ${item.name} to bag`}
                >
                    +
                </button>
            </div>

            {/* neeche info wala hissa: panelColor aur textColor */}
            <div
                className="sp-card-info"
                style={{
                    backgroundColor: item.panelColor || "#FFFFFF",
                    color: item.textColor || "#17132B",
                }}
            >
                <h3>{item.name}</h3>
                <p className="sp-price">
                    <strong>Rs. {money(finalPrice(item))}</strong>
                    {hasDiscount && <s>Rs. {money(item.price)}</s>}
                </p>
            </div>
        </article>
    );
}

/* ---------- main page ---------- */
const Profile = () => {
    const navigate = useNavigate();
    const pageRef = useRef(null);
    const bagRef = useRef(null);

    const [products, setProducts] = useState([]);
    const [status, setStatus] = useState("loading"); // loading | ready | error

    const [view, setView] = useState("all");
    const [sort, setSort] = useState("featured");
    const [query, setQuery] = useState("");
    const [bag, setBag] = useState(0);

    /* 1) Products server se lao */
    const loadProducts = async () => {
        setStatus("loading");
        try {
            const res = await axios.get(`${API}/shop`, { withCredentials: true });
            setProducts(res.data);
            setStatus("ready");
        } catch (err) {
            console.log(err);
            setStatus("error");
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    /* 2) View + search + sort lagakar dikhane wali list */
    const visible = useMemo(() => {
        let list = [...products];

        if (view === "new") list.reverse(); // naye products aakhir me bante hain
        if (view === "sale") list = list.filter((p) => p.discount > 0);

        const q = query.trim().toLowerCase();
        if (q) list = list.filter((p) => (p.name || "").toLowerCase().includes(q));

        if (sort === "low") list.sort((a, b) => finalPrice(a) - finalPrice(b));
        if (sort === "high") list.sort((a, b) => finalPrice(b) - finalPrice(a));
        if (sort === "discount") list.sort((a, b) => (b.discount || 0) - (a.discount || 0));

        return list;
    }, [products, view, sort, query]);

    const saleCount = products.filter((p) => p.discount > 0).length;
    const counts = { all: products.length, new: null, sale: saleCount };

    /* 3) Cards scroll karte hi ek ek karke aate hain (GSAP ScrollTrigger) */
    useEffect(() => {
        if (status !== "ready" || prefersReduced()) return;

        const ctx = gsap.context(() => {
            gsap.set(".sp-card", { opacity: 0, y: 50 });

            ScrollTrigger.batch(".sp-card", {
                start: "top 92%",
                once: true,
                onEnter: (batch) =>
                    gsap.to(batch, {
                        opacity: 1,
                        y: 0,
                        duration: 0.7,
                        stagger: 0.08,
                        ease: "power3.out",
                        overwrite: true,
                    }),
            });
        }, pageRef);

        return () => ctx.revert();
    }, [status, products, view, sort]);

    // list badalne par positions badal jati hain, isliye refresh
    useEffect(() => {
        ScrollTrigger.refresh();
    }, [visible]);

    /* 4) Bag me add (abhi sirf screen par count badhta hai, server me save nahi hota) */
    const addToBag = (item) => {
        setBag((n) => n + 1);
        toast.success(`${item.name} added to bag`);

        if (!prefersReduced() && bagRef.current) {
            gsap.fromTo(
                bagRef.current,
                { scale: 1 },
                { scale: 1.18, duration: 0.15, yoyo: true, repeat: 1, ease: "power2.out" }
            );
        }
    };

    /* 5) Logout */
    const handleLogout = async () => {
        try {
            await axios.post(`${API}/users/logout`, {}, { withCredentials: true });
            toast.success("Logout Successfully");
            navigate("/", { replace: true });
        } catch (err) {
            toast.error("Logout Failed");
        }
    };

    const clearFilters = () => {
        setView("all");
        setQuery("");
        setSort("featured");
    };

    /* ---------- UI ---------- */
    return (
        <div className="sp" ref={pageRef}>
            <header className="sp-nav">
                <div className="sp-brand">
                    <LogoMark />
                    <span>{BRAND}</span>
                </div>

                <div className="sp-nav-actions">
                    {/* <button ref={bagRef} className="sp-bag" aria-label={`Bag, ${bag} items`}>
                        <BagIcon />
                    </button> */}
                    <button className="sp-logout" onClick={handleLogout}>
                        Log out
                    </button>
                </div>
            </header>

            <div className="sp-layout">
                {/* ===== left menu ===== */}
                <aside className="sp-side">
                    <p className="sp-side-title">Browse</p>

                    <nav className="sp-views">
                        {VIEWS.map((v) => (
                            <button
                                key={v.id}
                                className={`sp-view ${view === v.id ? "is-active" : ""}`}
                                onClick={() => setView(v.id)}
                                aria-pressed={view === v.id}
                            >
                                <span>{v.label}</span>
                                {counts[v.id] !== null && <em>{counts[v.id]}</em>}
                            </button>
                        ))}
                    </nav>

                    <p className="sp-side-foot">© 2026 {BRAND}</p>
                </aside>

                {/* ===== products ===== */}
                <main className="sp-main">
                    <div className="sp-head">
                        <div>
                            <h1>Our collection</h1>
                            <p className="sp-count">
                                {status === "ready"
                                    ? `${visible.length} ${visible.length === 1 ? "product" : "products"}`
                                    : " "}
                            </p>
                        </div>

                        <div className="sp-tools">
                            <input
                                className="sp-search"
                                type="search"
                                placeholder="Search products"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                aria-label="Search products"
                            />

                            <select
                                className="sp-sort"
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                aria-label="Sort products"
                            >
                                {SORTS.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {status === "loading" && (
                        <div className="sp-grid" aria-busy="true">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div className="sp-skel" key={i}>
                                    <div className="sp-skel-img" />
                                    <div className="sp-skel-line" />
                                    <div className="sp-skel-line sp-skel-short" />
                                </div>
                            ))}
                        </div>
                    )}

                    {status === "error" && (
                        <div className="sp-state">
                            <h2>Couldn't load products</h2>
                            <p>Check your connection and try again.</p>
                            <button className="sp-primary" onClick={loadProducts}>
                                Try again
                            </button>
                        </div>
                    )}

                    {status === "ready" && products.length === 0 && (
                        <div className="sp-state">
                            <h2>The store is empty for now</h2>
                            <p>New products will show up here as soon as they are added.</p>
                        </div>
                    )}

                    {status === "ready" && products.length > 0 && visible.length === 0 && (
                        <div className="sp-state">
                            <h2>Nothing matches</h2>
                            <p>Try a different search or view.</p>
                            <button className="sp-primary" onClick={clearFilters}>
                                Clear filters
                            </button>
                        </div>
                    )}

                    {status === "ready" && visible.length > 0 && (
                        <div className="sp-grid">
                            {visible.map((item) => (
                                <ProductCard key={item._id} item={item}  />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Profile;