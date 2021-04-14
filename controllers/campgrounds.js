const Campground = require('../models/campgroud');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocoder = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}

module.exports.newForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user;
    campground.geometry = geoData.body.features[0].geometry;
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully created campground');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampgrounds = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Unable to find this campground');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });

}

module.exports.editCampgrounds = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Unable to find this campground');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });

}

module.exports.updateCampgrounds = async (req, res) => {
    const { id } = req.params;
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const camp = await Campground.findByIdAndUpdate(id, req.body.campground);
    camp.geometry = geoData.body.features[0].geometry;
    const images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    camp.images.push(...images);
    await camp.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await camp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${id}`);
}

module.exports.deleteCampgrounds = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground');
    res.redirect('/campgrounds');
}