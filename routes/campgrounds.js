const express = require('express');
const router = express.Router();
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');
const { campgroundSchema } = require('../schemas');
const Review = require('../models/review');
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');
const campgrounds = require('../controllers/campgrounds');
const multer = require('multer')
const { storage } = require('../cloudinary');
const upload = multer({ storage })

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))

router.get('/new', isLoggedIn, campgrounds.newForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampgrounds))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampgrounds))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampgrounds))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.editCampgrounds))

module.exports = router;