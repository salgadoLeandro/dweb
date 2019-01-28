var express = require('express');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var File = require('../../controllers/api/file');

var router = express.Router();

var key = 'randomkey';

//Find file
router.get('/:iid', passport.authenticate('jwt', {session: false}),
    (req, res) => {
        try {
            var dec = jwt.verify(req.session.token, key);
            File.findPrivate(req.params.iid, dec.user._id)
                .then(dados => res.jsonp(dados))
                .catch(error => res.status(500).send(error));
        }
        catch (error) {
            res.status(401).send(error);
        }
    }
);

//Add new file
router.post('/', passport.authenticate('jwt', {session: false}),
    (req, res) => {
        try{
            jwt.verify(req.session.token, key);
            File.insert(req.body)
                .then(dados => res.jsonp(dados))
                .catch(error => res.status(500).send(error));
        }
        catch(error) {
            res.status(401).send(error);
        }
    }
);

//Delete file
router.delete('/:iid', passport.authenticate('jwt', {session: false}),
    (req, res) => {
        try{
            jwt.verify(req.session.token, key);
            File.delete(req.params.iid)
                 .then(dados => res.jsonp(dados))
                 .catch(error => res.status(500).send(error));
        }
        catch (error) {
            res.status(401).send(error);
        }
    }
);

module.exports = router;