
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminPanel() {
    const navigate = useNavigate()
    const [err, seterr] = useState("")
    const [form, setForm] = useState({
        product: "",
        image: "",
        name: "",
        price: "",
        discount: 0,
        bgColor: "",
        panelColor: "",
        textColor: "",
        buffer: ""
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const createproduct = async (e) => {
        e.preventDefault();
        // Yahan API request karna
        try{

         axios.post("http://localhost:3000/products",
            form,
            {Credential:true})
         console.log(form);

        }catch(err){
            console.log(err.massage);
            
        }
    };

    const logoutAdmin = async () => {
    try {
        await axios.post(
            "http://localhost:3000/owners/logout",
            {},
            { withCredentials: true }
        );

        navigate("/profile");

    } catch (err) {
        console.log(err);
    }
   };
    return (
        <>
        <nav><button onClick={ logoutAdmin }>Logout</button></nav>
        <div>
            <h2>Admin Panel</h2>

            <form onSubmit={createproduct}>
                {Object.keys(form).map((key) => (
                    <input
                        key={key}
                        type={["price", "discount"].includes(key) ? "number" : "text"}
                        name={key}
                        placeholder={key}
                        value={form[key]}
                        onChange={handleChange}
                    />
                ))}

                <button type="submit">Create Product</button>
            </form>
        </div>
        </>
    );
}

export default AdminPanel;
