const express = require("express")
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const catchAsync = require('./utility/catchAsync');
const ExpressError = require('./utility/ExpressError');
const Campground = require('./models/campground');
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

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//for parsing the body
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

// app.use((req, res, next) => {
//     console.log(req.method, req.path);
//     console.log('============')
//     console.log(req.body)
//     if(req.body.campground){
//         console.log(req.body.campground._id)
//     }
//     // console.log(`req id ${req.body.campground._id}`)
//     next()
// })

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

//sending the payload to the server
app.post('/campgrounds', catchAsync(async (req, res, next) => {
    if(!req.body.campground){
        throw new ExpressError('Invalid Campground Data', 400)
    }
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

//show a single campground
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', {campground});
}))

//edit a single campground
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {campground});
}))

//add a campground to the server
app.put('/campgrounds/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`)
}))

//delete a campground
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not Found', 404))
})

app.use((err, req, res, next) => {
    const {statusCode = 500, message = 'Something went wrong'} = err;
    res.status(statusCode).send(message)
})

//=================================
app.listen(port, () => {
    console.log(`LISTENING TO PORT ${port}`)
})
 
