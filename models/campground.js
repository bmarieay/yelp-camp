const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require('./review');


const ImageSchema = new Schema({
    url: String,
    filename: String
})

//note: this is solely for image property, not the campground itself
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
})

ImageSchema.virtual('showSize').get(function () {
    return this.url.replace('/upload', '/upload/h_480')
})

const opts = { 
    toJSON: { virtuals: true },
    timestamps: true
}//include the properties virtual in schema obj

//basic model
const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String, 
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],//long and latitude
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>`
})

//delete reviews associated with the campground
CampgroundSchema.post('findOneAndDelete', async function(campground){
    if(campground){
        await Review.deleteMany({
            _id: {
                $in: campground.reviews
            }
        })
    }
})



module.exports = mongoose.model('Campground', CampgroundSchema);