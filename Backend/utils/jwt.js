const jwt = require("jsonwebtoken");

module.exports.generateToken = (user) => {
    return jwt.sign(
        { email: user.email, id: user._id },
        process.env.USER_SEC_KEY
    );
};

module.exports.AdminToken = (admin) => {
    return jwt.sign(
        { id: admin._id },
        process.env.ADMIN_SEC_KEY,
        { expiresIn: "2d" }
    );
};