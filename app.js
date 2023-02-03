const express = require('express')
const app = express()
var bodyParser = require('body-parser')
const mongoose = require('mongoose')
const  userModel = require('./models/userModel')
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const passportLocal = require('passport-local').Strategy
const session = require('express-session')
require('dotenv').config()
const path = require('path')
const articleRouter = require('./routes/articleRoute')
const moment = require('moment')
const userRouter = require('./routes/userRoute')
const port = process.env.PORT || 5000;

const {upload } = require('./midlewalres/multer')
const articleModel = require('./models/articleModel')


app.use('/' , express.static(__dirname + '/public'))
app.use('/user' , express.static(__dirname + '/public'))
app.use('/article' , express.static(__dirname + '/public'))
app.use('/article/view' , express.static(__dirname + '/public'))

// mongoose.connect(process.env.DB_URL_LIVE).then(res=>console.log('compass db connected')).catch(err => console.log(err))
 mongoose.connect("mongodb+srv://asim:mardan@cluster0.btwlh.mongodb.net/junaid_her?retryWrites=true&w=majority").then(res=>console.log('atlass db connecteed')).catch(err => console.log(err))


 

// parse application/json
app.use(bodyParser.json())

app.use(bodyParser.urlencoded({ extended: false }))
app.set("view engine" , "ejs")



app.use(session({
  secret : "mySuperSecret",
  resave: true,
  saveUninitialized : false,
}))
app.use(flash())


app.use(passport.initialize())
app.use(passport.session())

app.use('/article' , articleRouter)
app.use('/user' , userRouter)


passport.use(new passportLocal({usernameField : "email"},
  function(username, password, done) {
    userModel.findOne({ email : username }, async function   (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false , "No user Found !"); }
      if (! await bcrypt.compare(password ,user.password)) { return done(null, false , "Wrong credentials !"); }
      return done(null, user);
    });
  }
));

passport.serializeUser( (user, done) => {
  done(null, user._id)
})

passport.deserializeUser(async(userId, done) => {
  const userObj = await userModel.findById(userId)
  done(null, userObj)
})


app.get("/"   , async(req ,res) =>{
  const randomPost = await articleModel.aggregate(
      [ { $sample: { size: 1 } } ]
   )
  const articles = await articleModel.find().sort({'createdAt' : -1}).populate('author')
  if(req.user){
    return res.render('Homepage' ,{user : req.user , articles : articles , moment : moment  , randomPost:  randomPost[0]})
  }  
  res.render('Homepage' ,{user : null , articles : articles , moment : moment , randomPost : randomPost[0]})
})



app.get("/login"  ,  async(req ,res) =>{
 res.render('Login')
})




app.get("/register"  ,  async(req ,res) =>{
  res.render('Signup')
 })
 



app.post("/register" , upload.single('image'), async(req ,res) =>{
  const {firstName , lastName , email , password} = req.body
  const hashPassword = await bcrypt.hash(password , 10)
  const data  = new userModel({
    firstName ,
    lastName ,
    email ,
    profilePic : req.file?.filename,
    password : hashPassword
  })

  if(firstName === "" || lastName === "" || email === "" ){
    req.flash('error' , "Fill All Fields Properly !")
    return res.redirect('/register')
  }
  try {
    const findUser = await userModel.findOne({email : email})
    if(findUser){
      req.flash('error'  , 'user alraedy')
     res.redirect('/register')
    }
    const newUser =  await data.save()
    res.redirect("/login")
  } catch (error) {
    console.log(error)
    res.send({error})
  }

})


app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login' , failureFlash : true}),
  function(req, res) {
    req.flash('info', 'Flash Message Added');
    res.redirect('/');
  });





app.get('/logout', (req, res) => {
    req.logout(null, () => {
        res.redirect('/login')
    });
});




app.get('/*', (req, res) => {
 res.render('pageNotFound')
});





app.listen(port , ()=>{
    console.log(`server is running on port ${port} , http://localhost:${port}`)
})
