const mongoose = require("mongoose");
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
const axios = require("axios")
if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const key = process.env.API_KEY;

//get the model 
const Campground = require('../models/campground');
const campground = require("../models/campground");

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

const processDatas = async () => {
    try{
        const config = {
            params: 
            {
                api_key : key
            } 
        };
        const res = await axios.get(`https://developer.nps.gov/api/v1/campgrounds`, config);
        return res;
    } catch (e) {
        console.log("Connection timeout")
        console.log(e);
    }
}

//pick a rand from array length
const sample = array => array[Math.floor(Math.random() * array.length)];
 const savedata = async (campground) => {
        await campground.save;
}
const seedDB = async () => {
    await Campground.deleteMany({});
    const res = await processDatas();
    // for(let camp of res.data.data){
    //     console.log(camp.name)
    // }
   

    res.data.data.forEach( async (camp) => {
        console.log(camp.name)
        const price = Math.floor(Math.random() * 20) + 10;
        const campground = new Campground({
            author: '61f19eecbf9c697d0cb968b6',

            location: camp.addresses[0] ? 
                `${camp.addresses[0].line1} ${camp.addresses[0].city} ${camp.addresses[0].stateCode}`: 
                'No Location Found',
            title: camp.name,
            description: camp.description,
            // if(camp.fees[0].cost){
            //     price: camp.fees[0].cost
            // } else {
            //     price
            // }
            price: camp.fees[0] ? camp.fees[0].cost : price,
            geometry: {
                type: 'Point',
                coordinates: [
                    camp.longitude,
                    camp.latitude
                ]
            },
            images: [
                {
                    url: camp.images[0] ? camp.images[0].url : ''
                }
            ]
        }) 
        await campground.save();
        // savedata(campground);
    })
    // for(let i = 0; i < 200; i++){
    //     const random1000 = Math.floor(Math.random() * 1000);
    //     const price = Math.floor(Math.random() * 20) + 10;
    //     const camp = new Campground({
    //         //MY USER ID
    //         author: '61f19eecbf9c697d0cb968b6',
    //         location: `${cities[random1000].city}, ${cities[random1000].state}`,
    //         title: `${sample(descriptors)} ${sample(places)}`,
    //         description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Fugiat iusto quo ducimus ab, iste libero quibusdam expedita laudantium temporibus consequatur nemo eos, magni quis? Aliquid obcaecati quaerat placeat blanditiis deleniti!',
    //         price,
    //         geometry: {
    //             type: 'Point',
    //             coordinates: [
    //                 cities[random1000].longitude,
    //                 cities[random1000].latitude,

    //             ]
    //         },
    //         images:  [
    //             {
    //               url: 'https://res.cloudinary.com/maranttt/image/upload/v1643324249/YelpCamp/yybnzvyjcls8lk5ucve7.jpg',
    //               filename: 'YelpCamp/yybnzvyjcls8lk5ucve7'
    //             },
    //             {
    //               url: 'https://res.cloudinary.com/maranttt/image/upload/v1643324252/YelpCamp/uecxe5koy8ceyy9qvyof.jpg',
    //               filename: 'YelpCamp/uecxe5koy8ceyy9qvyof'
    //             }
    //         ]
    //     })
    //     await camp.save();
    // }
}

seedDB().then(() => {//close the database after running asyn generator above
    // mongoose.connection.close();
    console.log('done')
})