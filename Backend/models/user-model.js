const mongoose = require("mongoose")



const userModel = mongoose.Schema({
    fullName : {
        type:String,
        required: true,
        minLenght: 3,
        trim:true,
    } ,
    email : String ,
    password : String ,
    Card : {
        type: Array ,
        default : []
    } ,
    orders : {
        type :Array,
        default : []
    },
    contact : Number ,
    picture : String,
})


module.exports = mongoose.model("user",userModel)






