const router = require('express').Router()
const {upload }  = require('../midlewalres/multer')
const userModel = require('../models/userModel')
const checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) { return next() }
    res.redirect("/login")
  }

  const checkIsAdmin = (req, res, next) => {
    if (req.isAuthenticated()) { 
      if(req.user.isAdmin){
        return next()
      }else{
        return res.redirect("/login")
      }
     }
    res.redirect("/login")
  }


router.get('/' , async(req ,res) =>{
    res.send('user')
})





router.get("/admin"  , checkAuthenticated   , checkIsAdmin, async(req ,res) =>{
  res.render('Adminpanel' )
 })

router.get("/profile"  , checkAuthenticated , async(req ,res) =>{
    console.log(req.user)
    res.render('Profile' , {user : req.user})
   })
   

   router.post("/update_profile" , upload.single('image'), async(req ,res) =>{
    const {firstName , lastName , email } = req.body
     try {
      const findUser = await userModel.findOne({email : email})
      if(!findUser){
        req.flash('error'  , 'Something Went Wrong !')
       res.redirect('/user/profile')
      }

      findUser.firstName = firstName
      findUser.lastName = lastName
      findUser.email = email
      if(req.file){
        findUser.profilePic = req.file.filename
      }
      
      await findUser.save()
      req.flash('success' , "user Profile Updated !")
      res.redirect('/user/profile')
      
    } catch (error) {
      console.log(error)
      res.send({error})
    }
  
  })
   
  router.get("/delete_profile/:id"  , checkAuthenticated, async(req ,res) =>{
    const {id} = req.params
    const user = await userModel.findByIdAndRemove(id)
    req.flash('error' , "user Profile removed")
  res.redirect('/login')   
  })



module.exports = router;