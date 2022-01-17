const mongoose = require("mongoose");
const Campground = require('../models/campground');

//initial connection error
mongoose.connect('mongodb://localhost:27017/yelp-camp')
    .then(() => {
        console.log('CONNECTION MONGO OPEN!')
    })
    .catch((err) => {
        console.log('OH NO MONGO ERROR')
        console.log(err)
    })

//after initial connection error
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const seedDB = async () => {
    await Campground.deleteMany({});
    const c = new Campground({title: 'purple field'})
    await c.save();
}

seedDB();