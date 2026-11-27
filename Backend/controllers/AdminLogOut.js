const cookieOptions = require("../utils/cookieOptions");
const logoutAdmin = (req, res) => {
    try {
        res.clearCookie("Admin", cookieOptions);

        res.status(200).json({
            message: "Logout Successfully"
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = logoutAdmin;