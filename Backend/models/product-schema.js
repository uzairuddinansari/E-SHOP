const mongoose = require("mongoose")

const productSchema = mongoose.Schema({
    product: {
        type: String,
        required: true
    },
    image: String,
    name: String,
    price: Number,
    discount: {
        type: Number,
        default: 0
    },
    bgColor: String,
    panelColor: String,
    textColor: String,
    buffer: String
});


module.exports = mongoose.model("products",productSchema)


