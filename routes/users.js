const express = require("express");
const catchAsync = require('../utility/catchAsync')
const User = require('../models/user');
const passport = require("passport");
const router = express.Router();

router.get('/register', (req, res) => {
    res.render('users/register')
})
router.post('/register', catchAsync(async(req, res) => {
    try {
        const {username, email, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        req.flash('success', 'Welcome to YelpCamp')
        res.redirect('/campgrounds')
    } catch (e) {//instead of stopping the cycle via next, just redirect
        req.flash('error', e.message )
        res.redirect('/register');
    }
}))

router.get('/login', (req, res) => {
    res.render('users/login')
})

//will compare hashed password to the stored hash password
router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (req, res) => {
    req.flash('success', 'Welcome Back!')
    res.redirect('/campgrounds')
})

//log out the user
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Goodbye!')
    res.redirect('/campgrounds')
})

module.exports = router;