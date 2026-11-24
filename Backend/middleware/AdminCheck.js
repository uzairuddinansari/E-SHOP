const jwt = require("jsonwebtoken");
const OwnersSchema = require("../models/owner-schema");

const adminCheck = async (req, res, next) => {
    try {
        const token = req.cookies.Admin;

        if (!token) {
            return res.status(401).json({ message: "Admin login required" });
        }
        const decoded = jwt.verify(token, process.env.ADMIN_SEC_KEY);

        const admin = await OwnersSchema.findById(decoded.id);

        if (!admin) {
            return res.status(403).json({ message: "Admin not found" });
        }

        req.admin = admin;
        next();

    } catch (error) {
        return res.status(401).json({ message: "Unauthorized" });
    }
};

module.exports = adminCheck;