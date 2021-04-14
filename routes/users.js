const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const users = require('../controllers/users');

router.route('/register')
    .get(users.showRegisterPage)
    .post(catchAsync(users.authenticate))

router.route('/login')
    .get(users.showLoginPage)
    .post(passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), users.login)

router.get('/logout', users.logout)

module.exports = router;
