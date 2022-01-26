const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//below will incllude static methods to the User model
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

UserSchema.plugin(passportLocalMongoose); //this will include username & password

module.exports = mongoose.model('User', UserSchema);
