import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import "../../public/stylesheets/AdminPanel.css";

const API = import.meta.env.VITE_API_URL;
const HEX = /^#[0-9a-f]{6}$/i;

const COLOR_FIELDS = [
    { key: "bgColor", label: "Image background" },
    { key: "panelColor", label: "Info panel" },
    { key: "textColor", label: "Text" },
];

const emptyForm = {
    image: null,
    name: "",
    price: "",
    discount: 0,
    bgColor: "#E8ECF4",
    panelColor: "#FFFFFF",
    textColor: "#161B2E",
};

/* Colour field: swatch on top, hex code below */
function ColorField({ label, name, value, onChange }) {
    const valid = HEX.test(value);

    return (
        <div className="adm-color">
            <span className="adm-color-label">{label}</span>

            <label
                className={`adm-swatch ${valid ? "" : "adm-swatch--empty"}`}
                style={valid ? { background: value } : undefined}
            >
                <input
                    type="color"
                    value={valid ? value : "#000000"}
                    onChange={(e) => onChange(name, e.target.value.toUpperCase())}
                    aria-label={`${label} colour picker`}
                />
            </label>

            <input
                className={`adm-hex ${valid ? "" : "adm-hex--invalid"}`}
                type="text"
                value={value}
                maxLength={7}
                spellCheck={false}
                aria-label={`${label} hex code`}
                onChange={(e) => {
                    let v = e.target.value.trim();
                    if (v && v[0] !== "#") v = "#" + v;
                    onChange(name, v.toUpperCase());
                }}
            />
        </div>
    );
}

function AdminPanel() {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loadingList, setLoadingList] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [err, setErr] = useState("");
    const [query, setQuery] = useState("");

    const [form, setForm] = useState(emptyForm);
    const [preview, setPreview] = useState(null);
    const [fileKey, setFileKey] = useState(0);

    /* image preview */
    useEffect(() => {
        if (!form.image) {
            setPreview(null);
            return;
        }
        const url = URL.createObjectURL(form.image);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [form.image]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === "image" ? files[0] || null : value,
        }));
    };

    const setColor = (name, value) =>
        setForm((prev) => ({ ...prev, [name]: value }));

    const GetProduct = async () => {
        try {
            const res = await axios.get(`${API}/shop`, { withCredentials: true });
            setProducts(res.data);
        } catch (error) {
            console.log(error);
            toast.error("Couldn't load products");
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => {
        GetProduct();
    }, []);

    const createProduct = async (e) => {
        e.preventDefault();
        setErr("");

        if (!form.image) return setErr("Choose a product image.");
        for (const { key, label } of COLOR_FIELDS) {
            if (!HEX.test(form[key]))
                return setErr(`${label} needs a hex code like #1A2B3C.`);
        }
        if (Number(form.discount) < 0 || Number(form.discount) > 100)
            return setErr("Discount must be between 0 and 100.");

        try {
            setSubmitting(true);

            const data = new FormData();
            Object.keys(form).forEach((key) => data.append(key, form[key]));

            await axios.post(`${API}/products/create`, data, {
                withCredentials: true,
            });

            toast.success("Product created");
            setForm(emptyForm);
            setFileKey((k) => k + 1);
            GetProduct();
        } catch (error) {
            setErr(error.response?.data?.message || error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const logoutAdmin = async () => {
        try {
            await axios.post(`${API}/owners/logout`, {}, { withCredentials: true });
            toast.success("Logged out");
            navigate("/login/admin", { replace: true });
        } catch (error) {
            toast.error("Logout failed");
        }
    };

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return products;
        return products.filter((p) => (p.name || "").toLowerCase().includes(q));
    }, [products, query]);

    return (
        <div className="adm">
            <header className="adm-bar">
                <div className="adm-brand">
                    <strong>Shop admin</strong>
                    <span>Products</span>
                </div>
                <button className="adm-ghost" onClick={logoutAdmin}>
                    Log out
                </button>
            </header>

            <div className="adm-layout">
                {/* ---------- Add product ---------- */}
                <section className="adm-panel adm-form-panel">
                    <h2>Add product</h2>

                    <form onSubmit={createProduct} noValidate>
                        <label className="adm-drop">
                            <span className="adm-drop-tile">
                                {preview ? (
                                    <img src={preview} alt="Selected product" />
                                ) : (
                                    <span aria-hidden="true">+</span>
                                )}
                            </span>
                            <span className="adm-drop-text">
                                <strong>
                                    {form.image ? "Change image" : "Choose image"}
                                </strong>
                                <small>
                                    {form.image ? form.image.name : "PNG or JPG"}
                                </small>
                            </span>
                            <input
                                key={fileKey}
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={handleChange}
                            />
                        </label>

                        <label className="adm-field">
                            <span>Name</span>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <div className="adm-two">
                            <label className="adm-field">
                                <span>Price (Rs.)</span>
                                <input
                                    type="number"
                                    name="price"
                                    min="0"
                                    value={form.price}
                                    onChange={handleChange}
                                    required
                                />
                            </label>
                            <label className="adm-field">
                                <span>Discount (%)</span>
                                <input
                                    type="number"
                                    name="discount"
                                    min="0"
                                    max="100"
                                    value={form.discount}
                                    onChange={handleChange}
                                />
                            </label>
                        </div>

                        <div className="adm-colors">
                            {COLOR_FIELDS.map(({ key, label }) => (
                                <ColorField
                                    key={key}
                                    name={key}
                                    label={label}
                                    value={form[key]}
                                    onChange={setColor}
                                />
                            ))}
                        </div>

                        {err && (
                            <p className="adm-error" role="alert">
                                {err}
                            </p>
                        )}

                        <button className="adm-primary" type="submit" disabled={submitting}>
                            {submitting ? "Saving…" : "Create product"}
                        </button>
                    </form>
                </section>

                {/* ---------- Product list ---------- */}
                <section className="adm-panel">
                    <div className="adm-list-head">
                        <h2>
                            All products <em>{products.length}</em>
                        </h2>
                        <input
                            className="adm-search"
                            type="search"
                            placeholder="Search by name"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            aria-label="Search products"
                        />
                    </div>

                    {loadingList ? (
                        <p className="adm-empty">Loading products…</p>
                    ) : filtered.length === 0 ? (
                        <p className="adm-empty">
                            {products.length === 0
                                ? "No products yet. Add the first one from the form."
                                : "No product matches that name."}
                        </p>
                    ) : (
                        <ul className="adm-rows">
                            {filtered.map((item) => (
                                <li className="adm-row" key={item._id}>
                                    <div
                                        className="adm-thumb"
                                        style={{ background: item.bgColor }}
                                    >
                                        <img
                                            src={`data:image/jpeg;base64,${item.image}`}
                                            alt={item.name}
                                        />
                                    </div>

                                    <div className="adm-row-main">
                                        <h3>{item.name}</h3>
                                        <p>
                                            Rs. {item.price}
                                            {item.discount > 0 && (
                                                <span className="adm-badge">
                                                    {item.discount}% off
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    <ul className="adm-chips">
                                        {COLOR_FIELDS.map(({ key, label }) => (
                                            <li className="adm-chip" key={key} title={label}>
                                                <i style={{ background: item[key] }} />
                                                <span>{item[key]}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
}

export default AdminPanel;