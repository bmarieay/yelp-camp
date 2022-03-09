const Campground = require("../models/campground")
const User = require("../models/user")
const { cloudinary } = require("../cloudinary")
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const axios = require("axios");
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const {config, reverseGeo} = require("../tools/index");
/*
** TODO:IMPROVE ACCESSIBLITY
*/
module.exports.index = async (req, res) => {
    const result = {};
    result.results = [];
    const allCampgrounds = await Campground.find({});
    result.allItemsFetched = allCampgrounds.map( camp => camp).length;
    const max = Math.ceil(result.allItemsFetched / 20.0);
    let {page, limit, q} = req.query;
    page = parseInt(page);
        limit = parseInt(limit);
        if(!page || page < 0){
            page=1;//very first page
        }
        if (page > max){
            page=max;
        }
        if(!limit){
            limit=20;
        }
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        //get info for the pagination(prev and next)
        if(startIndex > 0){
            result.previous = {
                page: page - 1,
                limit
            }
        }
        if(endIndex < result.allItemsFetched){
            result.next = {
                page: page + 1,
                limit
            }
        }
        res.cookie('currentPage', page);

    if(!q){
        //if there is no filter passed just render all campgrounds
        res.clearCookie('filter');
        const campgrounds = await Campground.find().limit(limit).skip(startIndex);
        result.results = campgrounds;
        return res.render('campgrounds/index', {result});
    }

    //user filtered campgrounds
    const queried = await axios.get(`https://developer.nps.gov/api/v1/campgrounds?limit=50&stateCode=${q}`, config);
    let matchedCampground;  
    result.filter = q;
    if(queried.data.data.length) {
        //If found: save to database or just render if it already exists
        const campPromises = queried.data.data.map(async function(camp) {
            //make a more narrow filter for matching
            if(camp.images[0]){
                matchedCampground = await Campground.find({$and:[{title: camp.name},{description: camp.description}]});
                //make a new campground 
                if(matchedCampground.length){
                    result.results.push(...matchedCampground);
                } else {
                    const campground = new Campground({
                        location: camp.addresses[0] ? 
                            `${camp.addresses[0].line1} ${camp.addresses[0].city} ${camp.addresses[0].stateCode}`: 
                            await reverseGeo([Number.parseFloat( camp.longitude, 10), Number.parseFloat( camp.latitude, 10)]),
        
                        title: camp.name,
        
                        description: camp.description,
                        //assign no price if there is no cost
                        price: camp.fees[0] ? camp.fees[0].cost : 0,
                        
                        images: camp.images.map(c => ({ url: c.url})),
        
                        geometry: {
                            type: 'Point',
                            coordinates: [
                                camp.longitude,
                                camp.latitude
                            ]
                        }
                    }) 
                    await campground.save();
                    result.results.push(campground);
                }
            }
        });
        await Promise.all(campPromises);
    }
    // res.send(result);
    res.render('campgrounds/index', {result})
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
    result.mode = true;
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
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull: {images: {filename: {$in:  req.body.deleteImages}}}});
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
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