const Campground = require("../models/campground")
const User = require("../models/user")
const { cloudinary } = require("../cloudinary")
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
mbxGeocoding({ accessToken: mapBoxToken });
//TODO: MAKE A MIDDLEWARE FOR RENDERING INDEX
module.exports.index = async (req, res) => {
    const result = {};
    let {page, limit} = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    if(!page){
        page=1;//very first page
    }
    if(!limit){
        limit=15;
    }
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const allCampgrounds = await Campground.find({});
    const campgrounds = await Campground.find().limit(limit).skip(startIndex);
    //get info for the pagination(prev and next)
    if(startIndex > 0){
        result.previous = {
            page: page - 1,
            limit
        }
    }

    if(endIndex < allCampgrounds.map( camp => camp).length){
        result.next = {
            page: page + 1,
            limit
        }
    }
    res.cookie('currentPage', page);
    result.results = campgrounds;
    //for determining max number of pages
    result.allItemsFetched = allCampgrounds.map( camp => camp).length;
    res.render('campgrounds/index', {result});
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}

module.exports.createCamground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    //get user to associate the newly created camp
    const loggedUser = await User.findById(req.user._id);
    //validate location
    if(!geoData.body.features[0]){
        req.flash('error', 'Please enter a valid location')
        return res.redirect('/campgrounds/new')
    }
    campground.geometry = geoData.body.features[0].geometry;
    // req.files is an array added from multer
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    
    campground.author = loggedUser;

    //push newly created campground to user
    loggedUser.campgrounds.push(campground._id);
    
    await campground.save();
    await loggedUser.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showUserCampgrounds = async (req, res) => {
    const result = {};
    let {page, limit} = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    if(!page){
        page=1;//very first page
    }
    if(!limit){
        limit=10;
    }
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let user = await User.findById(req.user)
        .populate('campgrounds');
    //get info for the pagination(prev and next)
    if(startIndex > 0){
        result.previous = {
            page: page - 1,
            limit
        }
    }

    if(endIndex < user.campgrounds.map( camp => camp).length){
        result.next = {
            page: page + 1,
            limit
        }
    }

    res.cookie('currentPage', page);
    //for determining max number of pages
    result.allItemsFetched = user.campgrounds.map( camp => camp).length;
    //get the user and populate it
    user = await User.findById(req.user)
    .populate({
        path: 'campgrounds',
        options: {
            limit,
            skip: startIndex
        }
    });
    result.results = user.campgrounds;
    res.render('campgrounds/index', {result})
}

module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        })
        .populate('author');
    if(!campground){
        req.flash('error', 'Cannot find that campground!')
        return res.redirect('/campgrounds')
    }
    const {currentPage} = req.cookies;
    res.render('campgrounds/show', {campground, currentPage});
}

module.exports.renderEditForm = async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error', 'Cannot find that campground!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', {campground});
}

module.exports.editCampground = async (req, res) => {
    const {id} = req.params;
    //make this shorter later
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});//spread each properties
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.images.push(...imgs)
    await campground.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename)
        }
        await campground.updateOne({$pull: {images: {filename: {$in:  req.body.deleteImages}}}})
    }
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const {id} = req.params;
    //has mongoose middleware associated with it
    const deletedCampground = await Campground.findByIdAndDelete(id);

    for(let image of deletedCampground.images){//delete associated images in cloud
        await cloudinary.uploader.destroy(image.filename)
    }

    //also delete camp id from associated user
    await User.findByIdAndUpdate(deletedCampground.author, { $pull: {campgrounds: id} }, {new: true})

    req.flash('success', 'Successfully deleted campground!')
    res.redirect('/campgrounds');
}