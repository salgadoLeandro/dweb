var express = require('express');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var router = express.Router();

var key = 'randomkey';
var file_folder = './files/';

router.get('/', (req, res) => {
    res.redirect('/register');
});

router.get('/%2Fuser', (req, res) => {
    res.redirect('/user');
});

router.get('/register', (req, res) => {
    var message = req.session.message;
    delete req.session.message;
    req.session.save(() => {
        res.render('register', {message: message});
    });
});

router.post('/register', (req, res, next) => {
    req.body['gender'] = req.body['radio-choice-b'];
    delete req.body['radio-choice-b'];
    next();
}, passport.authenticate('register', {
    session: false,
    successRedirect: '/login',
    failureRedirect: '/register'
}));

router.get('/login', (req, res) => {
    var message = req.session.message;
    delete req.session.message;
    req.session.save(() => {
        res.render('login', { message: message });
    });
});

router.post('/login', async (req, res, next) => {
    passport.authenticate('login', async (err, user, info) => {
        try {
            if (err || !user) {
                if (err) {
                    return next(err);
                }
                else {
                    res.render('login', {message: info.message});
                    return;
                }
            }
            req.login(user, {session: false}, async (error) => {
                if (error) return next(error);
                var _user = {_id: user._id, email: user.email};
                //token generation
                var token = jwt.sign({user:_user}, key);
                req.session.token = token;
                req.session.save((err) => {
                    if (!err)
                        res.redirect('/user/');
                });
            });
        }
        catch (error) {
            return next(error);
        };
    }) (req, res, next);
});

module.exports = router;
