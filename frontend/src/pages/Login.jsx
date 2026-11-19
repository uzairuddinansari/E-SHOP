import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Login = () => {
    const  navigate = useNavigate()
    const [formData, setformData] = useState({
      email:"",
      password:""
    })

     const handleChange = (e) => {setformData({...formData, [e.target.name]: e.target.value})};

    const handleSubmit  = async(e)=>{
      e.preventDefault()
      try{

        let res = await axios.post("http://localhost:3000/users/login",
          formData,
          { withCredentials: true }
        )

         toast.success(res.data);
        navigate("/Profile")
      }catch(err){
         toast.error(err.response?.data || "Login Failed");
      } 
    }

   return (
        <form onSubmit={handleSubmit}>
            <input
                type="email"
                name="email"
                placeholder="Enter Email"
                value={formData.email}
                onChange={handleChange}
                required
            />

            <input
                type="password"
                name="password"
                placeholder="Enter Password"
                value={formData.password}
                onChange={handleChange}
                required
            />

            <button type="submit">Login</button>
            <Link to="/Signup"><button>Create New Account</button></Link>
        </form>
    );
}

export default Login;