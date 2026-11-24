const express = require("express");
const router = express.Router();
const T_middle_ware = require("../middleware/jwtCheck")
const productModel = require("../models/product-schema")

router.get("/",  T_middle_ware, (req, res) => {
    res.send("Products route working");
});

router.post("/create", T_middle_ware, async (req, res) => {
    try {
        const {
            product,
            image,
            name,
            price,
            discount,
            bgColor,
            panelColor,
            textColor,
            buffer
        } = req.body;

        const newProduct = await productModel.create({
            product,
            image,
            name,
            price,
            discount,
            bgColor,
            panelColor,
            textColor,
            buffer
        });

        res.status(201).json({
            message: "Product created successfully",
            product: newProduct
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



module.exports = router;