const express = require("express");
const router = express.Router();
const loginCheckAuth = require("../controllers/AdminAuthVerify")
const logoutAdmin = require("../controllers/AdminLogOut")
const CreateAdmin = require("../controllers/CreateAdmin")
const AdminAuth = require("../middleware/AdminCheck")


if (process.env.NODE_ENV === "development") {
    router.post("/create", CreateAdmin);
}

router.get("/", (req, res) => {
    res.send("hey I am owner's");
});

router.post("/login", loginCheckAuth);

router.post("/logout", logoutAdmin)

router.get("/check/Admin", AdminAuth, (req,res)=>{
   try{
     res.status(201).send("shop is Here")
    }
    catch(err){
        res.status(500).send(err.massage)
    }
})



module.exports = router;
