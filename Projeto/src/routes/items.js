var express = require('express');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var User = require('../controllers/api/user');
var Item = require('../controllers/api/item');
var File = require('../controllers/api/file');
var router = express.Router();

var key = 'randomkey';

router.get('/:iid', passport.authenticate('jwt', {session: false}),
    (req, res) => {
        try {
            var dec = jwt.verify(req.session.token, key);
            Item.getItem(dec.user._id, req.params.iid)
                .then(dados => {
                    if (dados.length)
                        res.render('item', { data: dados });
                    else
                        res.sendStatus(404);
                })
                .catch(error => res.status(500).send(error));
        }
        catch (error) {
            res.status(401).send(error);
        }
    }
);

router.post('/search', passport.authenticate('jwt', { session: false }),
    (req, res) => {
        try {
            var dec = jwt.verify(req.session.token, key);
            var hash = req.body.hashtag;
            hash = '#' + hash.replace(/( |#)/g, '');
            Item.searchHash(dec.user._id, hash, req.body.page)
                .then(dados => {
                    var data = {
                        type: 'item',
                        data: dados
                    };
                    res.render('search', {results: data});
                })
                .catch(error => res.status(500).send(error));
        }
        catch (error) {
            res.status(401).send(error);
        }
    }
);

module.exports = router;