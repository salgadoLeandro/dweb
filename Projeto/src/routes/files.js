var express = require('express');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var File = require('../controllers/api/file');
var router = express.Router();

var key = 'randomkey';
var file_folder = './files/';

router.get('/:fid', passport.authenticate('jwt', {session: false}),
    (req, res) => {
        try {
            var dec = jwt.verify(req.session.token, key);
            File.findPrivate(req.params.fid, dec.user._id)
                .then(dados => {
                    //res.jsonp(dados);
                    res.setHeader('Content-Description', 'File Transfer');
                    res.setHeader('Content-Type', 'application/octet-stream');
                    res.setHeader('Content-Transfer-Encoding', 'binary');
                    res.setHeader('Content-Disposition', 'attachment; filename=' + dados[0].original);
                    res.setHeader('Expires', 0);
                    res.setHeader('Cache-control', 'must-revalidate, post-check=0, pre-check=0');
                    res.setHeader('Pragma', 'public');
                    //console.log(res);
                    res.download(file_folder+dados[0]._id, dados[0].original);
                })
                .catch(error => {
                    console.log(error);
                    res.status(500).send(error);
                });
        }
        catch (error) {
            console.log(error);
            res.status(401).send(error);
        }
    }
);

module.exports = router;
