var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var User = require('../controllers/api/user');

var key = 'randomkey';

// Register new user
passport.use('register', new localStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
    try {
        var user = await User.insert(req.body);
        return done(null, user);
    }
    catch(error){
        return done(error);
    }
}));

// User login
passport.use('login', new localStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        var user = await User.getUserEmail(email);
        
        if (!user)
            return done(null, false, {message: 'User doesn\'t exist!'});
        
        var valid = await user.isValidPassword(password);
        if (!valid)
            return done(null, false, {message: 'Invalid password!'});

        return done(null, user, {message: 'Login successful!'});
    }
    catch(error) {
        return done(error);
    }
}));

// Autenticação com JWT
var JWTStrategy = require('passport-jwt').Strategy;
var ExtractJWT = require('passport-jwt').ExtractJwt;

var extractFromSession = function(req) {
    var token = null;
    if (req && req.session) token = req.session.token;
    return token;
};

passport.use(new JWTStrategy({
    secretOrKey: key,
    jwtFromRequest: ExtractJWT.fromExtractors([extractFromSession])
}, async (token, done) => {
    try {
        return done(null, token.user);
    }
    catch(error) {
        return done(error);
    }
}));