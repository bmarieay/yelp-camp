const express = require("express");
const catchAsync = require('../utility/catchAsync')
const passport = require("passport");
const router = express.Router();
const users = require("../controllers/users")

router.route('/register')
    .get(users.renderRegister )
    //add registered user to the server
    .post(catchAsync(users.register))

router.route('/login')
    .get(users.renderLogin)
    //will compare hashed password to the stored hash password
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.login)

//log out the user
router.get('/logout', users.logout)

module.exports = router; 