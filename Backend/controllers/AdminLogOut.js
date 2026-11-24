const logoutAdmin = (req, res) => {
    try {
        res.clearCookie("Admin", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        });

        res.status(200).json({
            message: "Logout Successfully"
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = logoutAdmin;