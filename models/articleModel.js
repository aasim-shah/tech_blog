const mongoose = require('mongoose')

const articleSchema  = mongoose.Schema({
   headline : {type : String , required : true},
   subHeadline : {type : String },
   authorName : {type : String },
   authorProfilePic : {type : String },
   authorId : String,
   content : {type : String , required : true},
   image : String,
   author  : {type : mongoose.Schema.Types.ObjectId , ref : "user"},
   createdAt : {type : Date , default : Date.now()}

},{
   timestamps : true
})


const articleModel = mongoose.model('article', articleSchema)
module.exports = articleModel;
