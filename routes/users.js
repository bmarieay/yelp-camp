const express = require("express");
const catchAsync = require('../utility/catchAsync')
const User = require('../models/user');
const passport = require("passport");
const router = express.Router();
const users = require("../controllers/users")

router.get('/register', users.renderRegister )
router.post('/register', catchAsync(users.register))

router.get('/login', users.renderLogin)

//will compare hashed password to the stored hash password
router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.login)

//log out the user
router.get('/logout', users.logout)

module.exports = router;