const express = require("express")
const router = express.Router()
const T_middle_ware = require("../middleware/jwtCheck")


router.get("/",(req,res)=>{
    res.send("Hello world")
})

router.get("/shop",T_middle_ware,(req,res)=>{
    try{

     res.status(201).send("shop is Here")
    }
    catch(err){
        
        res.status(500).send(err.massage)
    }
})


module.exports = router;