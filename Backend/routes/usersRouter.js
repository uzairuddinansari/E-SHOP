const express = require("express");
const router = express.Router();
const createUser = require("../controllers/userAuthGenerate")
const {loginuser} = require("../controllers/loginAuthVerify")
const {logoutuser} = require("../controllers/loginAuthVerify")
const T_middle_ware = require("../middleware/jwtCheck")


router.get("/", (req, res) => { res.send("Users route working")});

router.post("/login", loginuser)

router.post("/logout", logoutuser)

router.post("/create", createUser);

router.get("/check-auth", T_middle_ware, (req, res) => {
    res.status(200).json({ authenticated: true });
});

module.exports = router;