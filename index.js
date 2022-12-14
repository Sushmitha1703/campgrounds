if(process.env.NODE_ENV!=='production'){
    require('dotenv').config()
}
//mongodb+srv://sushmitha:<password>@cluster0.8az0s4s.mongodb.net/?retryWrites=true&w=majority
const express=require('express')
const mongoose = require('mongoose')
const app=express()
const session=require('express-session')
const ejsmate=require('ejs-mate')
const flash=require('connect-flash')
const passport =  require('passport')
const user=require('./models/user')
const Plocal =  require('passport-local')
const MongoStore = require('connect-mongo')
//const favicon= require('serve-favicon')

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campground');
const reviewRoutes = require('./routes/reviews');

const dbUrl= process.env.DB_URL || 'mongodb://localhost:27017/campground';
//
mongoose.connect(dbUrl,{
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl:true
})
const db=mongoose.connection
db.on('error',console.log.bind(console,'connection error'))
db.once('open',()=>{
    console.log('database connected')
})


app.engine('ejs',ejsmate)
app.set('view engine','ejs')
app.set('views',__dirname+'/views')
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use('/public',express.static(__dirname+'/public'))


const secret= process.env.SECRET || 'thisisasecret'

const store =  MongoStore.create({
    mongoUrl:dbUrl,
    secret,
    touchAfter:24*60*60
})

store.on("error", function(e){
    console.log("SESSION STORE ERROR")
})

const sessionConfig={
    store,
    secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires:Date.now + 1000*60*60*24*7 , 
        maxAge:1000*60*60*24*7
    }
}

app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new Plocal(user.authenticate()))
passport.serializeUser(user.serializeUser())
passport.deserializeUser(user.deserializeUser())



app.use((req,res,next)=>{
    res.locals.currentUser= req.user
    res.locals.success = req.flash('success')
    res.locals.error=req.flash('error')
    next();
})


app.use('/', userRoutes);
app.use('/campground', campgroundRoutes)
app.use('/campground/:id/reviews', reviewRoutes)

app.get('/',(req,res)=>{
    res.render('home.ejs')
})

app.all('*',(req,res,next)=>{
    next(new catchexpress('page not found',404))
})

app.use((err,req,res,next)=>{
  const { message='something went wrong',Statuscode=500}=err
  res.status(Statuscode).render('error',{err})
})

const port= process.env.PORT || '8000'
app.listen(port,()=>{
    console.log(`listening on port ${port}`)
})
