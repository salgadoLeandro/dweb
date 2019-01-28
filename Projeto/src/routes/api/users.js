var express = require('express');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var User = require('../../controllers/api/user');
var Item = require('../../controllers/api/item');
var File = require('../../controllers/api/file');

var router = express.Router();

var key = 'randomkey';
var file_folder = './files/';


// Get timeline
router.get('/', passport.authenticate('jwt', {session: false}),
    (req, res) => {
        try{
            var dec = jwt.verify(req.session.token, key);
            User.getTimeline(dec.user._id, req.body.page)
                .then(dados => res.jsonp(dados))
                .catch(error => res.status(500).send(error));
        }
        catch (error) {
            console.log(error);
            res.status(401).send(error);
        }
    }
);

// Search users
router.get('/search', passport.authenticate('jwt', {session: false}),
    (req, res) => {
        try {
            var dec = jwt.verify(req.session.token, key);
            if (req.body.name) {
                User.listNamePrivate(dec.user._id, req.body.name, req.body.page)
                    .then(dados => res.jsonp(dados))
                    .catch(error => res.status(500).send(error));
            }
            else if (req.body.email) {
                User.getUserEmailPrivate(dec.user._id, req.body.email)
                    .then(dados => res.jsonp(dados))
                    .catch(error => res.status(500).send(error));
            }
            else {
                res.sendStatus(404);
            }
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
            req.session.save(() => res.sendStatus(200));
        }
        catch (error) {
            res.status(401).send(error);
        }
    }
);

// Get user profile
router.get('/:uid', passport.authenticate('jwt', {session: false}),
    (req, res) => {
        try {
            var dec = jwt.verify(req.session.token, key);
            User.getUserPrivate(dec.user._id, req.params.uid)
                .then(dados => res.jsonp(dados))
                .catch(error => res.status(500).send(error));
        }
        catch (error) {
            res.status(401).send(error);
        }
    }
);

// Update user info
router.put('/profile', passport.authenticate('jwt', {session: false}),
    (req, res) => {
        try{
            var dec = jwt.verify(req.session.token, key);
            User.update(dec.user._id, req.body)
                .then(dados => res.jsonp(dados))
                .catch(error => res.status(500).send(error));
        }
        catch (error) {
            res.status(401).send(error);
        }
    }
);

// Accept/Refuse friend request
router.post('/requests', passport.authenticate('jwt', {session: false}),
    (req, res) => {
        try {
            var dec = jwt.verify(req.session.token, key);
            if (dec.user._id == req.body.user) {
                res.sendStatus(200);
            }
            var update = {
                $pull: { requests: req.body.user }
            };
            var fr = false;
            if (req.body.state || req.body.state == 'true' || req.body.state == 0) {
                update['$push'] = { friends: req.body.user };
                fr = true;
            }
            User.update(dec.user._id, update)
                .then(() => {
                    if (fr) {
                        update = {
                            $push: { friends: dec.user._id }
                        };
                        User.update(req.body.user, update)
                            .then(() => res.sendStatus(200))
                            .catch(error => res.status(500).send(error));
                    }
                    else {
                        res.sendStatus(200);
                    }
                })
                .catch(error => res.status(500).send(error));
        }
        catch (error) {
            res.status(401).send(error);
        }
    }
);

// Send friend request
router.post('/request/:uid', passport.authenticate('jwt', {session: false}), 
    (req, res) => {
        try {
            var dec = jwt.verify(req.session.token, key);
            if (dec.user._id == req.params.uid) {
                res.sendStatus(200);
            }
            var update = {
                $push: { requests: dec.user._id }
            };
            User.update(req.params.uid, update)
                .then(() => res.sendStatus(200))
                .catch(error => res.status(500).send(error));
        }
        catch (error) {
            res.status(401).send(error);
        }
    }
);

// Remove friend
router.post('/remove/:uid', passport.authenticate('jwt', {session:false}),
    (req, res) => {
        try {
            var dec = jwt.verify(req.session.token, key);
            if (dec.user._id == req.params.uid) {
                res.sendStatus(200);
            }
            var update = { $pull: { friends: req.params.uid } };
            User.update(dec.user._id, update)
                .then(() => {
                    update = { $pull: { friends: dec.user._id } };
                    User.update(req.params.uid, update)
                        .then(() => res.sendStatus(200))
                        .catch(error => res.status(500).send(error));
                })
                .catch(error => res.status(500).send(error));
        }
        catch (error) {
            res.status(401).send(error);
        }
    }
);

// Delete user
router.delete('/', passport.authenticate('jwt', {session: false}),
    (req, res) => {
        try {
            var dec = jwt.verify(req.session.token, key);
            User.delete(dec.user._id)
                .then(dados => {
                    dados.items.forEach(item => {
                        Item.delete(item)
                            .then(data => {
                                File.deleteMany(data.attached_files)
                                    .then(() => {
                                        data.attached_files.forEach(file => {
                                            fs.unlink(file_folder + file, () => {});
                                        });
                                    })
                                    .catch(error => console.log(error));
                            })
                            .catch(error => console.log(error));
                    });
                    var query = {
                        _id: {$in: dados.friends}
                    };
                    var update = {
                        $pull: {friends: dec.user._id}
                    };
                    User.updateMany(query, update)
                        .then(() => res.jsonp(dados))
                        .catch(error => res.status(500).send(error));
                })
                .catch(error => res.status(500).send(error));
        }
        catch (error) {
            res.status(401).send(error);
        }
    }
);

// Register user
router.post('/', passport.authenticate('register', {
    session: false,
    successRedirect: '/users/login',
    failureRedirect: '/users'
}));

// User login
router.post('/login', async (req, res, next) => {
    passport.authenticate('login', async (err, user, info) => {
        try {
            if (err || !user) {
                if (err)
                    return next(err);
                else
                    return next(new Error('User does not exist.'));
            }
            req.login(user, {session: false}, async (error) => {
                if (error) return next(error);
                var _user = {_id: user._id, email: user.email};
                //token generation
                var token = jwt.sign({user:_user}, key);
                req.session.token = token;
                req.session.save((err) => {
                    if (!err)
                        res.redirect('/api/users/' + _user._id);
                });
            });
        }
        catch (error) {
            return next(error);
        };
    }) (req, res, next);
});

module.exports = router;