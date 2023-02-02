const mongoose = require('mongoose')

const userSchema  = mongoose.Schema({
    firstName : String,
    lastName : String,
    isAdmin : Boolean,
    email : {type: String , required : true , lowercase: true,} ,
    password : {type: String , required : true  } ,
    profilePic : String,
    articles : [
        {type : mongoose.Schema.Types.ObjectId , ref : "article"}
    ]
})


const userModel = mongoose.model('user', userSchema)
module.exports = userModel;
