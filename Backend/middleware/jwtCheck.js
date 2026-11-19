const jwt = require("jsonwebtoken");
const userModel = require("../models/user-model");

module.exports = async (req, res, next) => {
    if (!req.cookies.token) {
        req.flash("error", "You need login First");
        return res.status(401).json({
            message: req.flash("error")
        });
    }

    try {
        const token = req.cookies.token;

        const verifyToken = jwt.verify(
            token,
            process.env.USER_SEC_KEY
        );

        let user = await userModel
            .findOne({ email: verifyToken.email })
            .select("-password");

        if (!user) {
            req.flash("error", "User Not Found");
            return res.status(401).json({
                message: req.flash("error")
            });
        }

        req.user = user;
        next();

    } catch (err) {
        req.flash("error", "Something Went Wrong");
        return res.status(401).json({
            message: req.flash("error")
        });
    }
};