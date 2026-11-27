const productModel = require("../models/product-schema")

module.exports.createProduct = async (req, res) => {
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
}

module.exports.updateProduct = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid product id" });
        }

        const { name, price, discount, bgColor, panelColor, textColor } = req.body;
        const updates = { name, price, discount, bgColor, panelColor, textColor };

        if (req.file) updates.image = req.file.buffer; // nayi image aayi to hi badlo

        const updated = await productModel.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true,
        });

        if (!updated) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ message: "Product updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.deleteProduct = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid product id" });
        }

        const deleted = await productModel.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: "Product not found" });
        }

        // jin users ke cart me ye product tha, wahan se bhi id hata do
        await usermodel.updateMany(
            { Card: deleted._id },
            { $pull: { Card: deleted._id } }
        );

        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}