const express = require("express");
const router = express.Router();
const catchAsync = require('../utility/catchAsync');
const {isLoggedIn, validateCampground, isAuthor} = require('../middleware')
const campgrounds = require("../controllers/campgrounds")
const multer = require("multer")//adds file body to request
const {storage} = require("../cloudinary")
const upload = multer({storage})
/*ALL ASYNC ROUTES ARE WRAPPED W/ CATCHASYNC TO
AVOID REPETITIVE TRY CATCHING*/

router.route('/')
    //show the campgrounds
    .get(catchAsync(campgrounds.index))
    //sending the payload to the server
    .post(isLoggedIn, upload.array('image'), validateCampground,  catchAsync(campgrounds.createCamground));
    
router.route('/user')//campgrounds/user
//check if user is logged in then show all owned campgrounds populated
    .get(isLoggedIn,catchAsync(campgrounds.showUserCampgrounds));
    

//showing the form
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    //show a single campground
    .get(catchAsync(campgrounds.showCampground))
    //add an updated campground to the server
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.editCampground))
    //delete a campground
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

//edit a single campground
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

module.exports = router;