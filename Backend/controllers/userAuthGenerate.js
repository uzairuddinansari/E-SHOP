const bcrypt = require("bcrypt");
const userSchema = require("../models/user-model");
const generateToken = require("../utils/jwt");

module.exports = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        const FindUser = await userSchema.findOne({ email });

        if (FindUser) res.status(409).send("Already EXIST")

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const user = await userSchema.create({
            fullName,
            email,
            password: hash,
        });

        const UserToken = generateToken(user);

        res.cookie("token", UserToken);
        res.status(201).send("User Created Successfully");

    } catch (err) {
        res.status(500).send(err.message);
    }
}