const Campground = require("../models/campground")
const User = require("../models/user")
const { cloudinary } = require("../cloudinary")
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const axios = require("axios");
const key = process.env.API_KEY;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
//TODO: AFTER NEED TO REFACTOR ASYNCS TO MIDDLEWARE
mbxGeocoding({ accessToken: mapBoxToken });
const config = {
    params: 
    {
        api_key : key
    } 
};

//TODO: MAKE A MIDDLEWARE FOR RENDERING INDEX
module.exports.index = async (req, res) => {
    const result = {};
    result.results = [];
    const allCampgrounds = await Campground.find({});
    result.allItemsFetched = allCampgrounds.map( camp => camp).length;
    const max = Math.ceil(result.allItemsFetched / 20.0);
    let {page, limit, q} = req.query;
    if(!q){//if there is no searching passed
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
        const campgrounds = await Campground.find().limit(limit).skip(startIndex);
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
        result.results = campgrounds;
        //for determining max number of pages
        return res.render('campgrounds/index', {result});
        // res.send(result);
    }
    //user searched for something
    const queried = await axios.get(`https://developer.nps.gov/api/v1/campgrounds?limit=3&q=${q}`, config);
    let matchedCampground;
    if(!queried.data.data.length){
        //do nothing if there is no result in api
        //store empty object in result for rendering in index template
        //store query for client use
        result.results = queried.data.data;
        result.query = q;
        return res.render('campgrounds/index', {result})
    } else {
        //If found: save to database or just render if it already exists
       //TODO: DO NOT BASE OFF OF THE FETCHED DATA BECAUSE IT HAS DIFFERENT JSON FORMAT FROM 
       //THE CAMPGROUND SCHEMA DEFINED
        const campPromises = queried.data.data.map(async function(camp) {
            matchedCampground = await Campground.find({title: camp.name});
            if(!matchedCampground.length && camp.images[0]){
                //make a new campground 
                const campground = new Campground({
                location: camp.addresses[0] ? 
                    `${camp.addresses[0].line1} ${camp.addresses[0].city} ${camp.addresses[0].stateCode}`: 
                    await reverseGeo([Number.parseFloat( camp.longitude, 10), Number.parseFloat( camp.latitude, 10)]),

                title: camp.name,

                description: camp.description,
                //assign a random price if there is no cost
                price: camp.fees[0] ? camp.fees[0].cost : price,
                

                images: camp.images.map(c => ({ url: c.url})),

                geometry: {
                    type: 'Point',
                    coordinates: [
                        camp.longitude,
                        camp.latitude
                    ]
                }
                }) 
                //NOTE:decide if need to save later
                // await campground.save();
                result.results.push(campground);
            } else {
                //MATCH FOUND
                result.results.push(camp);
            }
        });
        await Promise.all(campPromises);
    }
    // queried.data.data.forEach( async (camp, i) => {
    //     if(camp.images[0] && camp.name){
    //         const price = Math.floor(Math.random() * 20) + 10;
    //         const campground = new Campground({
    //         //do reverse lookup here!!!!!from the coordinates if no address available
    //         location: camp.addresses[0] ? 
    //             `${camp.addresses[0].line1} ${camp.addresses[0].city} ${camp.addresses[0].stateCode}`: 
    //             await reverseGeo([Number.parseFloat( camp.longitude, 10), Number.parseFloat( camp.latitude, 10)]),

    //         title: camp.name,

    //         description: camp.description,
    //         //assign a random price if there is no cost
    //         price: camp.fees[0] ? camp.fees[0].cost : price,

    //         geometry: {
    //             type: 'Point',
    //             coordinates: [
    //                 camp.longitude,
    //                 camp.latitude
    //             ]
    //         }
    //         }) 
    //         await upload(camp.images.map(img => img.url), campground);
    //         await User.findByIdAndUpdate(mainAuth, {$push:{campgrounds: campground}});
    //         //add cloud uploader for below. use only and save if campground not yet in database otherwise just show it
    //         if(campground.success !== 'fail') {
    //             await campground.save();
    //         }
    //         result.results.push()
    //     }
    // })
    // res.render('campgrounds/index', {result});
    res.send(result);
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