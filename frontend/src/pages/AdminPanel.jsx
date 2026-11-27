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

    /* ===== NEW: edit / delete ke liye states ===== */
    const [editingId, setEditingId] = useState(null);             // kaunsa product edit ho raha hai
    const [existingPreview, setExistingPreview] = useState(null); // edit me purani image ka preview
    const [deletingId, setDeletingId] = useState(null);           // kaunsa product delete ho raha hai

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

    /* ===== NEW: form ko khali karke "add" mode me wapas lao ===== */
    const cancelEdit = () => {
        setEditingId(null);
        setExistingPreview(null);
        setForm(emptyForm);
        setFileKey((k) => k + 1);
        setErr("");
    };

    /* ===== NEW: Edit dabane par product ka data form me bhar do ===== */
    const startEdit = (item) => {
        setEditingId(item._id);
        setExistingPreview(`data:image/jpeg;base64,${item.image}`);
        setForm({
            image: null, // nayi image na chuni to purani hi rahegi
            name: item.name || "",
            price: item.price ?? "",
            discount: item.discount || 0,
            bgColor: (item.bgColor || "#E8ECF4").toUpperCase(),
            panelColor: (item.panelColor || "#FFFFFF").toUpperCase(),
            textColor: (item.textColor || "#161B2E").toUpperCase(),
        });
        setFileKey((k) => k + 1);
        setErr("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    /* ===== CHANGED: createProduct ab create bhi karta hai aur update bhi ===== */
    const saveProduct = async (e) => {
        e.preventDefault();
        setErr("");

        if (!editingId && !form.image) return setErr("Choose a product image.");
        for (const { key, label } of COLOR_FIELDS) {
            if (!HEX.test(form[key]))
                return setErr(`${label} needs a hex code like #1A2B3C.`);
        }
        if (Number(form.discount) < 0 || Number(form.discount) > 100)
            return setErr("Discount must be between 0 and 100.");

        try {
            setSubmitting(true);

            const data = new FormData();
            if (form.image) data.append("image", form.image); // sirf nayi image ho to bhejo
            Object.keys(form).forEach((key) => {
                if (key !== "image") data.append(key, form[key]);
            });

            if (editingId) {
                await axios.put(`${API}/products/${editingId}`, data, {
                    withCredentials: true,
                });
                toast.success("Product updated");
            } else {
                await axios.post(`${API}/products/create`, data, {
                    withCredentials: true,
                });
                toast.success("Product created");
            }

            cancelEdit();
            GetProduct();
        } catch (error) {
            setErr(error.response?.data?.message || error.message);
        } finally {
            setSubmitting(false);
        }
    };

    /* ===== NEW: Delete ===== */
    const deleteProduct = async (item) => {
        if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;

        try {
            setDeletingId(item._id);
            await axios.delete(`${API}/products/${item._id}`, {
                withCredentials: true,
            });

            setProducts((prev) => prev.filter((p) => p._id !== item._id));
            if (editingId === item._id) cancelEdit();
            toast.success("Product deleted");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete product");
        } finally {
            setDeletingId(null);
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

    const shownPreview = preview || existingPreview;

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
                {/* ---------- Add / Edit product ---------- */}
                <section className="adm-panel adm-form-panel">
                    <h2>{editingId ? "Edit product" : "Add product"}</h2>

                    <form onSubmit={saveProduct} noValidate>
                        <label className="adm-drop">
                            <span className="adm-drop-tile">
                                {shownPreview ? (
                                    <img src={shownPreview} alt="Selected product" />
                                ) : (
                                    <span aria-hidden="true">+</span>
                                )}
                            </span>
                            <span className="adm-drop-text">
                                <strong>
                                    {form.image
                                        ? "Change image"
                                        : editingId
                                        ? "Replace image (optional)"
                                        : "Choose image"}
                                </strong>
                                <small>
                                    {form.image
                                        ? form.image.name
                                        : editingId
                                        ? "Keeps the current image"
                                        : "PNG or JPG"}
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
                            {submitting
                                ? "Saving…"
                                : editingId
                                ? "Update product"
                                : "Create product"}
                        </button>

                        {editingId && (
                            <button type="button" className="adm-ghost" onClick={cancelEdit}>
                                Cancel editing
                            </button>
                        )}
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
                                <li
                                    className={`adm-row ${editingId === item._id ? "is-editing" : ""}`}
                                    key={item._id}
                                >
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

                                    {/* ===== NEW: colours ke aage Edit aur Delete ===== */}
                                    <div className="adm-actions">
                                        <button
                                            type="button"
                                            className="adm-btn"
                                            onClick={() => startEdit(item)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            className="adm-btn adm-btn--danger"
                                            onClick={() => deleteProduct(item)}
                                            disabled={deletingId === item._id}
                                        >
                                            {deletingId === item._id ? "Deleting…" : "Delete"}
                                        </button>
                                    </div>
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