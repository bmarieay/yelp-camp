if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const express = require("express")
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const ExpressError = require('./utility/ExpressError');
const methodOverride = require("method-override");
const session = require('express-session')
const flash = require('connect-flash')
const passport = require("passport");
const LocalStrategy = require("passport-local")
const User = require('./models/user')
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')

const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");

const MongoDBStore = require("connect-mongo");

const dbUrl = process.env.DB_URL;
// const dbUrl = 'mongodb://localhost:27017/yelp-camp';
//initial connection error
mongoose.connect(dbUrl)
    .then(() => {
        console.log('CONNECTION MONGO OPEN!!!')
    })
    .catch((err) => {
        console.log('OH NO MONGO ERROR')
        console.log(err)
    })

    //after initial connection error
    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error:"));
    db.once("open", () => {
        console.log("Database connected");
    });
app.use(cookieParser());
app.engine('ejs', ejsMate);//for boilerplate embedding
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//for parsing the body
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
    "https://cdn.jsdelivr.net",
    
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
    "https://www.nps.gov",
    "https://res.cloudinary.com"
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/maranttt/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
                "https://www.nps.gov/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

const secret = process.env.SECRET || 'squirrel';
// const secret = 'squirrel';
const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});

store.on("error", function(e){
    console.log('SESSION STORE ERROR', e)
})

const sessionConfig = {
    store,
    name: 'sess',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash())
//authentication
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());//tells how the user will be included in the session
passport.deserializeUser(User.deserializeUser());//opposite of above

app.use((req, res, next) => {
    if(!['/login', '/'].includes(req.originalUrl)){
        req.session.returnTo = req.originalUrl;
    }
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);//need mergeparams here


app.get('/', (req, res) =>{
    res.render('home');
})

//all routes not hit (not found)
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not Found', 404))
})

//custom error handler
app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', {err})
})

//=================================
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`SERVING ON PORT ${port}`)
})
 
