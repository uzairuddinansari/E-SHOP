
const mongoose = require("mongoose")

const ownerSchema = mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        minLength: 3,
        trim: true,
    },
    email: String,
    password: String,
    products: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "product",
    default: []
    },
    gstin : Number ,
    picture : String,
})

module.exports = mongoose.model("owner", ownerSchema)
