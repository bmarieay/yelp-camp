const express = require("express");
const router = express.Router();
const catchAsync = require('../utility/catchAsync');
const ExpressError = require('../utility/ExpressError');
const Campground = require('../models/campground');
const {campgroundSchema} = require('../schemas')

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

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
    
}))

//showing the form
router.get('/new', (req, res) => {
    res.render('campgrounds/new')
})

/*ALL ASYNC ROUTES ARE WRAPPED W/ CATCHASYNC TO
AVOID REPETITIVE TRY CATCHING*/

//sending the payload to the server
router.post('/', validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

//show a single campground
router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
        .populate('reviews');//to also show reviews inside campground
    res.render('campgrounds/show', {campground});
}))

//edit a single campground
router.get('/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {campground});
}))

//add a campground to the server
router.put('/:id', validateCampground, catchAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});//spread each properties
    res.redirect(`/campgrounds/${campground._id}`)
}))

//delete a campground
router.delete('/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
    //has mongoose middleware associated with it
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))



module.exports = router;