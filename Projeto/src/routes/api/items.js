var express = require('express');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var Item = require('../../controllers/api/item');
var User = require('../../controllers/api/user');
var File = require('../../controllers/api/file');
var multer = require('multer');

var router = express.Router();
var multerM = multer({ dest: './uploads/' }).any();

var key = 'randomkey';
var file_folder = './files/';

// Search item by hashtags
router.get('/search', passport.authenticate('jwt', { session: false }),
    (req, res) => {
        try {
            var dec = jwt.verify(req.session.token, key);
            var hash = req.body.hashtag;
            hash = '#' + hash.replace(/( |#)/g, '');
            Item.searchHash(dec.user._id, hash, req.body.page)
                .then(dados => res.jsonp(dados))
                .catch(error => res.status(500).send(error));
        }
        catch (error) {
            res.status(401).send(error);
        }
    }
);

//Get user item
router.get('/:iid', passport.authenticate('jwt', {session: false}),
    (req, res) => {
        try {
            var dec = jwt.verify(req.session.token, key);
            Item.getItem(dec.user._id, req.params.iid)
                .then(dados => {
                    if (dados.length)
                        res.jsonp(dados[0]);
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

//Add new item
router.post('/', passport.authenticate('jwt', {session: false}), multerM,
    (req, res) => {
        try {
            var dec = jwt.verify(req.session.token, key);
            var body = req.body;
            if (body.title == '') delete body.title
            if (body.local == '') delete body.local
            if (req.files) {
                var files = [];
                var filenames = [];
                req.files.forEach(file => {
                    var path = file_folder + file.filename;
                    var _file = {
                        _id: file.filename,
                        user: dec.user._id,
                        original: file.originalname
                    };
                    files.push(_file);
                    filenames.push(file.filename);

                    fs.rename(file.path, path, () => {
                        fs.unlink(file.path, () => {
                            File.insert(_file)
                                .then(() => { })
                                .catch(error => {console.log(error)});
                        });
                    });
                });
                body.attached_files = filenames;
            }
            Item.insert(dec.user._id, body)
                .then(dados => {
                    User.update(dec.user._id, {$push: {items: dados._id.toString()}})
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

//Update item
router.put('/:iid', passport.authenticate('jwt', {session: false}), multerM,
    (req, res) => {
        try {
            var dec = jwt.verify(req.session.token, key);
            Item.checkAccess(dec.user._id, req.params.iid)
                .then(dados => {
                    console.log(req.body);
                    if (dados.length < 1) {
                        res.sendStatus(401);
                        return;
                    }
                    if (req.body.comment_level == 0) {
                        var timestamp = req.body.timestamp.replace(/[a-z].*/gi, '');
                        var update = {
                            $push: {
                                comments: {
                                    timestamp: timestamp,
                                    author: dados[0].author,
                                    userid: dec.user._id,
                                    text: req.body.text,
                                    replies: []
                                }
                            }
                        }
                        Item.update(req.params.iid, update)
                            .then(dados1 => res.jsonp(dados1))
                            .catch(error => res.status(500).send(error));
                    }
                    else if (req.body.comment_level >= 1) {
                        var varname = 'comments.' + req.body.cindex + '.replies';
                        var timestamp = req.body.timestamp.replace(/[a-z].*/gi, '');
                        var push = {};
                        push[varname] = {
                            timestamp: timestamp,
                            author: dados[0].author,
                            userid: dec.user._id,
                            text: req.body.text
                        }
                        var update = { $push: push };
                        Item.update(req.params.iid, update)
                            .then(dados1 => res.jsonp(dados1))
                            .catch(error => res.status(500).send(error));
                    }
                    else if (req.files) {
                        var files = [];
                        var filenames = [];
                        req.files.forEach(file => {
                            var reg = file.originalname.match(/\.[^\s.]*$/g);
                            var path = file_folder + file.filename;
                            var _file = {
                                _id: file.filename,
                                user: dec.user._id,
                                extension: reg
                            };
                            files.push(_file);
                            filenames.push(file.filename);
                            
                            fs.rename(file.path, path, () => {
                                fs.unlink(file.path, () => {
                                    File.insert(_file)
                                         .then(() => {})
                                         .catch(() => {});
                                });
                            });
                        });
                        var update = { 
                            $push : { attached_files: { $each: filenames } },
                            $set: req.body
                        };

                        Item.update(req.params.iid, update)
                            .then(dados1 => res.jsonp(dados1))
                            .catch(error => res.status(500).send(error));
                    }
                    else if (req.body.delete_files) {
                        var update = {
                            $pull: { attached_files: { $in: req.body.delete_files } },
                            $set: req.body
                        };
                        
                        req.body.delete_files.forEach(file => {
                            File.find(file, dec.user._id)
                                .then(() => {
                                    File.delete(file)
                                        .then(() => fs.unlink(file_folder + file, () => {}))
                                        .catch(error => console.log(error));
                                })
                                .catch(error => console.log(error));
                        })

                        Item.update(req.params.iid, update)
                            .then(dados1 => res.jsonp(dados1))
                            .catch(error => res.status(500).send(error));
                    }
                    else {
                        Item.update(req.params.iid, req.body)
                            .then(dados1 => res.jsonp(dados1))
                            .catch(error => res.status(500).send(error));
                    }
                })
                .catch(error => res.status(401).send(error));
        }
        catch (error) {
            res.status(401).send(error);
        }
    }
);

//Delete item
router.delete('/:iid', passport.authenticate('jwt', {session: false}),
    (req, res) => {
        try {
            var dec = jwt.verify(req.session.token, key);
            Item.checkAccess(dec.user._id, req.params.iid)
                .then(result => {
                    if (result.length != 1) {
                        res.sendStatus(401);
                        return;
                    }
                    Item.delete(req.params.iid)
                        .then(dados => {
                            User.update(dec.user._id, {$pull: {items: req.params.iid}})
                                .then(() => {
                                    File.deleteMany(dados.attached_files)
                                        .then(() => {
                                            dados.attached_files.forEach(file => {
                                                fs.unlink(file_folder + file, () => {});
                                            });
                                            res.jsonp(dados);
                                        })
                                        .catch(error => res.status(500).send(error));
                                })
                                .catch(error => res.status(500).send(error));
                        })
                        .catch(error => res.status(500).send(error));
                    })
                    .catch(() => res.sendStatus(401));
        }
        catch (error) {
            res.status(401).send(error);
        }
    }
);

module.exports = router;