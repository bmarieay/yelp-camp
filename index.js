const express = require("express")
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const Campground = require('./models/campground');
const port = 3000;

//initial connection error
mongoose.connect('mongodb://localhost:27017/yelp-camp')
    .then(() => {
        console.log('CONNECTION MONGO OPEN!!!')
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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) =>{
    res.render('home')
})

app.get('/makecampground', async (req, res) => {
    const camp = new Campground({title: 'My Backyard', description: 'cheap camping'})
    await camp.save();
    res.send(camp);
})

app.listen(port, () => {
    console.log(`LISTENING TO PORT ${port}`)
})

