const checkAuthenticated = require('../midlewalres/authMiddleware')
const { upload } = require('../midlewalres/multer')
const articleModel = require('../models/articleModel')

const router = require('express').Router()


router.get('/' , async(req ,res) =>{
    res.send('articvles')
})


router.get('/new'  , checkAuthenticated, async(req ,res) =>{
    res.render('AddArticle')
})




router.post('/new' , checkAuthenticated, upload.single('image') ,async(req ,res) =>{
    const user  = req.user
    const {headline , subHeadline  , content} = req.body
    console.log(req.body)
    console.log(user)
    const data =  new articleModel({
        headline , 
        subHeadline ,
        content,
        author : req.user._id,
        authorId : req.user._id,
        authorName : req.user.firstName + " " + req.user.lastName,
        authorProfilePic : req.user.profilePic,
        image : req.file?.filename
    })
const saved_data = await data.save()

    user.articles.push(saved_data._id)
    console.log(data)
    await user.save()
    req.flash('success' , 'New Article Added !')
    res.redirect('/user/admin')
})


router.get('/edit/:id' , async(req ,res) =>{
    const {id } = req.params
    const article = await articleModel.findById(id)
    res.render('EditArticle' , {article})
})



router.get('/view/:id' , async(req ,res) =>{
    const {id } = req.params
    const articles = await articleModel.find().sort({'createdAt' : -1}).populate('author')
    const article = await articleModel.findById(id)
    res.render('ViewArticle' , {article , articles })
})


router.post('/edit' , upload.single('image') , async(req ,res) =>{
    const { articleId , headline , subHeadline  , content} = req.body
    const article = await articleModel.findById(articleId)
    article.headline = headline
    article.subHeadline = subHeadline
    article.content = content 
    article.image = req.file?.filename || article.image
    await article.save()
    req.flash('success' , "Article Updated !")
    res.redirect('back')
})

router.get('/delete/:id' , async(req ,res) =>{
    const {id  ,} = req.params
    const article = await articleModel.findByIdAndRemove(id)
    req.flash('error' , "Article Deleted )")
    res.redirect('/')
})


module.exports = router;