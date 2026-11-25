const jwt = require("jsonwebtoken");
const userModel = require("../models/user-model");
const OwnersSchema = require("../models/owner-schema");

module.exports = async (req, res, next) => {
    try {
        if (req.cookies.Admin) {
            const decoded = jwt.verify(req.cookies.Admin, process.env.ADMIN_SEC_KEY);
            const admin = await OwnersSchema.findById(decoded.id).select("-password");
            if (admin) {
                req.admin = admin;
                req.role = "admin";
                return next();
            }
        }
        if (req.cookies.token) {
            const decoded = jwt.verify(req.cookies.token, process.env.USER_SEC_KEY);
            const user = await userModel.findOne({ email: decoded.email }).select("-password");
            if (user) {
                req.user = user;
                req.role = "user";
                return next();
            }
        }
        return res.status(401).json({ message: "Login required" });
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized" });
    }
};