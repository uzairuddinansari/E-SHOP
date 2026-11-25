const express = require("express")
const router = express.Router()
const anyAuth = require("../middleware/anyAuth")
const product = require("../models/product-schema")


router.get("/",(req,res)=>{
    res.send("Hello world")
})

router.get("/shop", anyAuth, async (req, res) => {
    try {
        let All_products = await product.find({});

        const products = All_products.map(item => ({
            ...item.toObject(),
            image: item.image.toString("base64")
        }));

        res.status(200).json(products);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;