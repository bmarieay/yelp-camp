const express = require("express")
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const catchAsync = require('./utility/catchAsync');
const ExpressError = require('./utility/ExpressError');
const {campgroundSchema, reviewsSchema} = require('./schemas')
const Campground = require('./models/campground');
const Review = require('./models/review');
const methodOverride = require("method-override");
const { nextTick } = require("process");
const port = 3000;

//initial connection error
mongoose.connect('mongodb://localhost:27017/yelp-camp')
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

app.engine('ejs', ejsMate);//for boilerplate embedding
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//for parsing the body
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

//client side validation for campground w/ Joi
const validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

//client side validation for reviewss w/ Joi
const validateReview = (req, res, next) => {
    const {error} = reviewsSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}


app.get('/', (req, res) =>{
    res.render('home')
})

//show campgrounds route
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
    
}))

//showing the form
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})

/*ALL ASYNC ROUTES ARE WRAPPED W/ CATCHASYNC TO
AVOID REPETITIVE TRY CATCHING*/

//sending the payload to the server
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

//show a single campground
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
        .populate('reviews');//to also show reviews inside campground
    res.render('campgrounds/show', {campground});
}))

//edit a single campground
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {campground});
}))

//add a campground to the server
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});//spread each properties
    res.redirect(`/campgrounds/${campground._id}`)
}))

//delete a campground
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
    //has mongoose middleware associated with it
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

//make a review associated with a campground
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

//delete a review in a campground
app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async(req, res) => {
    const {id, reviewId} = req.params;
    //delete matching review in campground
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))

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
app.listen(port, () => {
    console.log(`LISTENING TO PORT ${port}`)
})
 
