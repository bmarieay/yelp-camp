const express = require("express");
const router = express.Router({ mergeParams: true });
const Campground = require('../models/campground');
const Review = require('../models/review');
const catchAsync = require('../utility/catchAsync');
const {validateReview} = require('../middleware')


//make a review associated with a campground
router.post('/', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created a new review!')
    res.redirect(`/campgrounds/${campground._id}`);
}))

//delete a review in a campground
router.delete('/:reviewId', catchAsync(async(req, res) => {
    const {id, reviewId} = req.params;
    //delete matching review in campground
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!')
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;