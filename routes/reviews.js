const express = require("express");
const router = express.Router({ mergeParams: true });

const Campground = require('../models/campground');
const Review = require('../models/review');

const ExpressError = require('../utility/ExpressError');
const catchAsync = require('../utility/catchAsync');
const {reviewsSchema} = require('../schemas')
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


//make a review associated with a campground
router.post('/', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

//delete a review in a campground
router.delete('/:reviewId', catchAsync(async(req, res) => {
    const {id, reviewId} = req.params;
    //delete matching review in campground
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;