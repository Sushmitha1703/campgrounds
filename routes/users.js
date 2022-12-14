const express=require('express')
const router= express.Router()
const campGround=require('../models/travel')
var bodyParser = require('body-parser')
const {campgroundschema, reviewSchema}=require('./joischemas')
const catchasync=require('../utils/Asyncerrors')
const catchexpress=require('../utils/expresserrors')
const session=require('express-session')
const methodOverride=require('method-override')
const reviews = require('../models/reviews')
const user=require('../models/user')
const passport= require('passport')
const campgrounds= require('../controllers/campground')
const reviewsController= require('../controllers/reviews')
const userController= require('../controllers/users')
const multer  = require('multer')
const {storage}= require('../cloudinary/index')
const upload = multer({storage:storage})
const {loggedin,isauthor,validatedata,validatereview, isreviewauthor}= require('../middleware')




router.use(methodOverride('_method'))
router.use(bodyParser.urlencoded({ extended: true }))
router.use(bodyParser.json())


router.route('/register')
     .get(catchasync(userController.register))
     .post(catchasync(userController.postregister));

router.route('/login')
     .get(catchasync(userController.loginpage))
     .post(passport.authenticate('local',{failureFlash:true, failureRedirect:'/login',keepSessionInfo:true}),catchasync(userController.login))

router.get('/logout',catchasync(userController.logout))


module.exports= router