const express = require("express");
const router = express.Router({ mergeParams: true });
const Campground = require('../models/campground');
const Review = require('../models/review');
const catchAsync = require('../utility/catchAsync');
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware')
const reviews = require("../controllers/reviews")

//make a review associated with a campground
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

//delete a review in a campground
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;