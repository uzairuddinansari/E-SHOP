const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const adminCheck = require("../middleware/AdminCheck")
const upload = require("../config/multer")
const {createProduct,updateProduct,deleteProduct} = require("../controllers/ProductAuth")

router.get("/",  adminCheck, (req, res) => {
    res.send("Products route working");
});

router.post("/create", adminCheck, upload.single("image"), createProduct);

/* ---------- UPDATE (sirf admin) ---------- */
router.put("/:id", adminCheck, upload.single("image"),updateProduct);

/* ---------- DELETE (sirf admin) ---------- */
router.delete("/:id", adminCheck, deleteProduct);


module.exports = router;