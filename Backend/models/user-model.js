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
    Card : [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'products' // Must match the exact name used in mongoose.model('Card', cardSchema)
  }],
    orders : {
        type : Array,
        default : []
    },
    contact : Number ,
    picture : String,
})


module.exports = mongoose.model("user",userModel)






