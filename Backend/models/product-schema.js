const mongoose = require("mongoose")

const productSchema = mongoose.Schema({
   
product : String,
image : String,
name : String,
price : Number,
discount : {
    typeof : Number,
    default : 0,
} ,
bgColor : String,
panelColor  : String ,
textColor: String,
})


module.exports = mongoose.model("products",productSchema)


