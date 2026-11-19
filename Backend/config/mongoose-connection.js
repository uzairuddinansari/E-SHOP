const mongoose = require("mongoose")
const dub = require("debug")("development:mongoose")
const confiq = require("config")

mongoose
    .connect(`${confiq.get("MONGODB_URL")}/E-SHOP`)
    .then(() => {

        dub("connected")
    })
    .catch((err) => {

    })

module.exports = mongoose.connection