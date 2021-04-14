if (process.env.NODE_ENV !== 'Production') {
    require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const { urlencoded } = require('express');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');
const userRoutes = require('./routes/users');
const session = require('express-session');
const flash = require('connect-flash');
const User = require('./models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const {scriptSrcUrls, styleSrcUrls, connectSrcUrls} = require('./content');
const { error } = require('console');
const MongoDBStore = require('connect-mongodb-session')(session);
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelpCamp';

//mongoose connection
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Database Connected!');
});

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
    replaceWith:'_'
}
));

const secret = process.env.SECRET || 'thisshouldbeabettersecret';

const store = new MongoDBStore({
    uri : dbUrl,
    secret: secret
})

store.on("error", function(e){
    console.log(`SESSION STORE ERROR ${e}`)
})

//Setting up the session.
const sessionConfig = {
    store : store,
    name : 'session',
    httpOnly: true,
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly : true,
        //secure : true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: [],
        connectSrc: ["'self'",...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'","'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'",...styleSrcUrls],
        workerSrc:["'self'","blob:"],
        objectSrc:[],
        imgSrc : [
            "'self'",
            "blob:",
            "data:",
            "https://res.cloudinary.com/dlr7itjgh/",
            "https://images.unsplash.com/"
        ],
        fontSrc: ["'self'"],
      },
})
);
//Setting up Passport.
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//setting up the flash.
app.use(flash());
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: 'ratneshpatil117@gmail.com', username: 'Devil199' });
    const newUser = await User.register(user, 'ratnesh');
    res.send(newUser);
})

//Authentication router
app.use('/', userRoutes);
//camogrounds router
app.use('/campgrounds', campgrounds);
//reviews router
app.use('/campgrounds/:id/review', reviews);


app.all('*', (req, res, next) => {
    next(new ExpressError(404, 'Page not found!'));
})

app.use((err, req, res, next) => {
    const { status = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something went wrong!'
    res.status(status).render('error', { err });
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`LISTENING TO PORT ${port}!`);
})