const OwnersSchema = require("../models/owner-schema")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const loginCheckAuth = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await OwnersSchema.findOne({ email });

        if (!admin) {
            return res.status(404).json({
                message: "Admin not found"
            });
        }

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }

        const AdminToken = jwt.sign(
            { id: admin._id },
            process.env.ADMIN_SEC_KEY,
            { expiresIn: "2d" }
        );

        res.cookie("Admin", AdminToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none"
});

        res.json({
            message: "Admin Login Successful"
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = loginCheckAuth