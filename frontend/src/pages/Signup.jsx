import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const  navigate = useNavigate()
  const [err, seterr] = useState("")
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({...formData,[e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const response = await axios.post("http://localhost:3000/users/create",formData,{ withCredentials: true });

      toast.success(response.data);
       seterr("");
      navigate("/")
    } catch (err) {
        seterr(err.response?.data || "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="fullName"
        placeholder="Full Name"
        value={formData.fullName}
        onChange={handleChange}
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
      />
      {err && <p className="error">{err}</p>}
      <button type="submit">Create Account</button>
     <Link to="/"><button>I have already Account</button></Link>
    </form>
  );
};

export default Signup;
