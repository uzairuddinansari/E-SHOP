import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Profile = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axios.post(
                "http://localhost:3000/users/logout",
                {},
                { withCredentials: true }
            );

            toast.success("Logout Successfully");
            navigate("/", { replace: true });

        } catch (err) {
            toast.error("Logout Failed");
        }
    };

    return (
        <>
            <button onClick={handleLogout}>Logout</button>
            <div>Profile</div>
        </>
    );
};

export default Profile;