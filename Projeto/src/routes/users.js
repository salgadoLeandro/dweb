var express = require('express');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var User = require('../controllers/api/user');
var Item = require('../controllers/api/item');
var File = require('../controllers/api/file');
var router = express.Router();

var key = 'randomkey';

router.get('/', passport.authenticate('jwt', {session: false}),
    (req, res) => {
		try {
			var dec = jwt.verify(req.session.token, key);
			User.getTimeline(dec.user._id, req.body.page)
				.then(dados => {
					res.render('landing', {data: dados})
				})
				.catch(error => res.status(500).send(error));
		}
		catch (error) {
			res.status(401).send(error);
		}
    }
);

router.get('/profile', passport.authenticate('jwt', {session: false}),
    (req, res) => {
        try {
            var dec = jwt.verify(req.session.token, key);
            res.redirect('/user/'+dec.user._id);
        }
        catch (error) {
            res.status(401).send(error);
        }
    }
);

router.get('/logout', passport.authenticate('jwt', {session: false}),
    (req, res) => {
        try {
            jwt.verify(req.session.token, key);
            delete req.session.token;
            req.session.save(() => {
                res.redirect('/login');
            })
        }
        catch (error) {
            console.log(error);
            res.status(401).send(error);
        }
    }
);

router.get('/:uid', passport.authenticate('jwt', {session: false}),
    (req, res) => {
        try {
            var dec = jwt.verify(req.session.token, key);
            User.getUserPrivate(dec.user._id, req.params.uid)
                .then(dados => {
                    var data = dados[0];
                    data['self'] = dec.user._id == req.params.uid;
                    res.render('profile', {data: data});
                })
                .catch(error => res.status(500).send(error));
        }
        catch (error) {
            res.status(401).send(error);
        }
    }
);

router.post('/search', passport.authenticate('jwt', {session: false}),
    (req, res) => {
        try {
            var dec = jwt.verify(req.session.token, key);
            if (req.body.name) {
                User.listNamePrivate(dec.user._id, req.body.name, req.body.page)
                    .then(dados => {
                        var data = {
                            type: 'user',
                            data: dados
                        };
                        res.render('search', {results: data});
                    })
                    .catch(error => {
                        console.log(error);
                        res.status(500).send(error)
                    });
            }
            else if (req.body.email) {
                User.getUserEmailPrivate(dec.user._id, req.body.email)
                    .then(dados => {
                        var data = {
                            type: 'user',
                            results: dados
                        };
                        res.render('search', {data: data});
                    })
                    .catch(error => {
                        console.log(error);
                        res.status(500).send(error)
                    });
            }
            else {
                res.sendStatus(404);
            }
        }
        catch (error) {
            console.log(error);
            res.status(401).send(error);
        }
    }
);

module.exports = router;
