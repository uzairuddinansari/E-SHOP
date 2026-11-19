const userSchema = require("../models/user-model");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/jwt");

module.exports.loginuser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userSchema.findOne({ email });
        if (!user) {
            return res.status(404).send("User Not Found");
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send("Invalid Password");
        }

        const UserToken = generateToken(user);
        
        res.cookie("token", UserToken, {
            httpOnly: true,
        });
        res.status(201).send("Login Successfully");
    } catch (err) {
        res.status(500).send(err.message);
    }
};

// log-out route 
module.exports.logoutuser = (req, res) => {
     res.cookie("token","")
    res.status(200).send("Logout Successfully");
};