const mongoose = require("mongoose")
const dub = require("debug")("development:mongoose")
mongoose
    .connect(`${process.env.MONGODB_URL}/E-SHOP`)
    .then(() => {

        dub("connected")
    })
    .catch((err) => {

    })

module.exports = mongoose.connection