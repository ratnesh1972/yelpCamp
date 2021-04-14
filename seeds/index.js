const mongoose = require('mongoose');
const Campground = require('../models/campgroud');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers')

mongoose.connect('mongodb://localhost:27017/yelpCamp', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Database Connected!');
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            geometry:{
                type:"Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/dlr7itjgh/image/upload/v1616485350/yelpCamp/vx4un3xd1sc4evcxfnnk.jpg',
                    filename: 'yelpCamp/vx4un3xd1sc4evcxfnnk.jpg'
                },
                {
                    url: 'https://res.cloudinary.com/dlr7itjgh/image/upload/v1616485351/yelpCamp/oful8lq11fi2oqmedlkl.jpg',
                    filename: 'yelpCamp/oful8lq11fi2oqmedlkl'
                }
            ],
            description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
            price: Math.floor((Math.random() * 30) + 10),
            author: '602a23369e193c72c3c6749b'
        })
        await camp.save();
    }

}

seedDB().then(() => {
    mongoose.connection.close();
})