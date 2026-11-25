const userSchema = require("../models/user-model");
const bcrypt = require("bcrypt");
const { AdminToken: generateAdminToken, generateToken } = require("../utils/jwt");
const ownerAuthority = require("../models/owner-schema");

module.exports.loginuser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await ownerAuthority.findOne({ email });

        if (admin) {
            const isMatch = await bcrypt.compare(password, admin.password);

            if (!isMatch) {
                return res.status(401).send("Invalid Password");
            }

            const adminToken = generateAdminToken(admin);

            res.cookie("Admin", adminToken, {
                httpOnly: true,
                sameSite: "lax"
            });

            return res.status(200).json({ message: "Admin Login Successfully", role: "admin" });
        }

        const user = await userSchema.findOne({ email });

        if (!user) {
            return res.status(404).send("User Not Found");
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).send("Invalid Password");
        }

        const userToken = generateToken(user);

        res.cookie("token", userToken, {
            httpOnly: true,
            sameSite: "lax"
        });

        res.status(200).json({ message: "User Login Successfully", role: "user" });

    } catch (err) {
        res.status(500).send(err.message);
    }
};

module.exports.logoutuser = (req, res) => {
    res.clearCookie("token");
    res.clearCookie("Admin");

    res.status(200).send("Logout Successfully");
};