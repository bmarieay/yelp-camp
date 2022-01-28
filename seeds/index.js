const mongoose = require("mongoose");
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
//get the model 
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

//pick a rand from array length
const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i = 0; i < 50; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '61f19eecbf9c697d0cb968b6',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Fugiat iusto quo ducimus ab, iste libero quibusdam expedita laudantium temporibus consequatur nemo eos, magni quis? Aliquid obcaecati quaerat placeat blanditiis deleniti!',
            price,
            images:  [
                {
                  url: 'https://res.cloudinary.com/maranttt/image/upload/v1643324249/YelpCamp/yybnzvyjcls8lk5ucve7.jpg',
                  filename: 'YelpCamp/yybnzvyjcls8lk5ucve7'
                },
                {
                  url: 'https://res.cloudinary.com/maranttt/image/upload/v1643324252/YelpCamp/uecxe5koy8ceyy9qvyof.jpg',
                  filename: 'YelpCamp/uecxe5koy8ceyy9qvyof'
                }
            ]
        })
        await camp.save();
    }
}

seedDB().then(() => {//close the database after running asyn generator above
    mongoose.connection.close();
})