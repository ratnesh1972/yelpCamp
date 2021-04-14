const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');
const User = require('./user');


const ImageSchema = new Schema({
    url: String,
    filename: String
})

const opts = { toJSON: { virtuals: true } };

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_100');
})

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
},opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<h4><a href='/campgrounds/${this._id}'>${this.title}</a></h4><p>${this.location}</p>`
})

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);