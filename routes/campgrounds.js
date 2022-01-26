const express = require("express");
const router = express.Router();
const catchAsync = require('../utility/catchAsync');
const Campground = require('../models/campground');
const {isLoggedIn, validateCampground, isAuthor} = require('../middleware')
const campgrounds = require("../controllers/campgrounds")


/*ALL ASYNC ROUTES ARE WRAPPED W/ CATCHASYNC TO
AVOID REPETITIVE TRY CATCHING*/

//show the campgrounds
router.get('/', catchAsync(campgrounds.index))

//showing the form
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

//sending the payload to the server
router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCamground))

//show a single campground
router.get('/:id', catchAsync(campgrounds.showCampground))

//edit a single campground
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

//add an updated campground to the server
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.editCampground))

//delete a campground
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

module.exports = router;