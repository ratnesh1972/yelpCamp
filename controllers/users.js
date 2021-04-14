const User = require('../models/user');

module.exports.authenticate = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = await new User({ username, email });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!')
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}

module.exports.showRegisterPage = (req, res) => {
    res.render('users/register');
}

module.exports.showLoginPage = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    const redirectTo = req.session.returnTo;
    const redirectURL = redirectTo || '/campgrounds';
    req.flash('success', 'Welcome Back');
    delete req.session.returnTo;
    res.redirect(redirectURL);
}

module.exports.logout = (req, res) => {
    req.logOut();
    req.flash('success', 'Logged Out');
    res.redirect('/campgrounds');
}