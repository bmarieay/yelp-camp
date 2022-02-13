const Campground = require("../models/campground")
const User = require("../models/user")
const { cloudinary } = require("../cloudinary")
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })
mbxGeocoding({ accessToken: mapBoxToken })

module.exports.index = async (req, res) => {
    // const campgrounds = await Campground.find({});
    const result = {};
    let {page, limit} = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    if(!page){
        page=1;//very first page
    }
    if(!limit){
        limit=5;
    }
    const startIndex = (page - 1) * limit;
    console.log(startIndex)
    const endIndex = page * limit;
    console.log(endIndex)
    // const skip = (page - 1) * limit; //resource to be loaded
    console.log(page, limit);
    const allCampgrounds = await Campground.find({});
    
    const campgrounds = await Campground.find().limit(limit).skip(startIndex);
    if(startIndex > 0){
        console.log("entered first")
        result.previous = {
            page: page - 1,
            limit: limit
        }
    }
    // console.log(allCampgrounds.map( camp => camp).length, "LENGTH")
    if(endIndex < allCampgrounds.map( camp => camp).length){
        console.log("entered sec")
        result.next = {
            page: page + 1,
            limit: limit
        }
    }
    
    result.results = campgrounds;
    // const campgrounds = await Campground.find({}, {}, {limit: limit, skip: skip})
    // res.render('campgrounds/index', {campgrounds});
    // res.send({//use this idea for dynamic page loading in index file
    //     page,
    //     size,
    //     campgrounds
    // })
    //use below to disable next button page
    if(!campgrounds.length){//if there is no more to load
        console.log(campgrounds)
    }
    // res.send(result)
    //convert to int for the pagination index file
    res.render('campgrounds/index', {result});
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}
//cut description if long
//fix images

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
    console.log("before", loggedUser)
    loggedUser.campgrounds.push(campground._id);
    
    console.log("after", loggedUser)
    await campground.save();
    await loggedUser.save();
    // console.log(loggedUser);
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showUserCampgrounds = async (req, res) => {
    //get the user and populate it
    const user = await User.findById(req.user)
        .populate('campgrounds');
    const campgrounds = user.campgrounds;
    // res.send(campgrounds);
    res.render('campgrounds/index', {campgrounds})
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
    res.render('campgrounds/show', {campground});
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
    console.log(req.body)
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
        console.log(campground)
    }
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const {id} = req.params;
    //has mongoose middleware associated with it
    const deletedCampground = await Campground.findByIdAndDelete(id);
    // const camp = await Campground.findById(id)
    // const ownerUser = await User.findById(deletedCampground.author._id);
    // console.log("OWNER IS before deletion: ", ownerUser);

    for(let image of deletedCampground.images){//delete associated images in cloud
        await cloudinary.uploader.destroy(image.filename)
    }

    //also delete camp id from associated user
    // await ownerUser.updateOne({$pull: {campgrounds: {_id: camp._id}}});
    const user = await User.findByIdAndUpdate(deletedCampground.author, { $pull: {campgrounds: id} }, {new: true})


    console.log("OWNER IS AFTER DELETION: ", user);
    
    req.flash('success', 'Successfully deleted campground!')
    res.redirect('/campgrounds');
}