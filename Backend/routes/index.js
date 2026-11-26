const express = require("express")
const router = express.Router()
const anyAuth = require("../middleware/anyAuth")
const jwtCheck = require("../middleware/jwtCheck")
const product = require("../models/product-schema")
const usermodel = require("../models/user-model")
const mongoose = require("mongoose");

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

router.get("/cart", jwtCheck, async (req, res) => {
    try {
        let cart = await usermodel
            .findOne({ email: req.user.email })
            .populate("Card");

        if (!cart) {
            return res.status(404).send("User not found");
        }

        console.log("CART IDS ON SERVER:", cart.Card.length); // ye line temporary hai

        const items = cart.Card.filter(Boolean).map((item) => ({
            ...item.toObject(),
            image: item.image.toString("base64"),
        }));

        res.status(200).json(items);

    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.delete("/cart/:id", jwtCheck, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send("Invalid product id");
        }

        await usermodel.findByIdAndUpdate(req.user._id, {
            $pull: { Card: req.params.id }
        });

        res.status(200).send("Product removed from cart");
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get("/add/products/:id", jwtCheck, async (req, res) => {
    try {
        let AddCard = await usermodel.findOne({
            email: req.user.email
        });

        if (!AddCard) {
            return res.status(404).send("User not found");
        }

        AddCard.Card.push(req.params.id);

        await AddCard.save();

        res.status(200).send("Product added to card");

    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;