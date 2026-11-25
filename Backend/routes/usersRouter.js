const express = require("express");
const router = express.Router();
const createUser = require("../controllers/userAuthGenerate")
const {loginuser,logoutuser} = require("../controllers/loginAuthVerify")
const anyAuth = require("../middleware/anyAuth")

router.get("/", (req, res) => { res.send("Users route working")});

router.post("/login", loginuser)

router.post("/logout", logoutuser)

router.post("/create", createUser);

router.get("/check-auth", anyAuth, (req, res) => {
    res.status(200).json({ authenticated: true, role: req.role });
});

module.exports = router;