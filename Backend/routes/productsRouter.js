const express = require("express");
const router = express.Router();
const anyAuth = require("../middleware/anyAuth")
const productModel = require("../models/product-schema")
const upload = require("../config/multer")

router.get("/",  anyAuth, (req, res) => {
    res.send("Products route working");
});

router.post("/create", anyAuth, upload.single("image"), async (req, res) => {
    try {
        const {name,price,discount,bgColor,panelColor,textColor} = req.body;
        
        const newProduct = await productModel.create({
            image:req.file.buffer,
            name,
            price,
            discount,
            bgColor,
            panelColor,
            textColor,
        });

        res.status(201).json({
            message: "Product created successfully",
            product: newProduct
        });

        res.send(newProduct)

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



module.exports = router;