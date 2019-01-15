var express = require('express');
var axios = require('axios');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    axios.get('http://clav-test.di.uminho.pt/api/classes/nivel/1')
        .then(resposta => res.render('index', {lista: resposta.data}))
        .catch(erro => {
            res.render('error', {title: 'Erro', error: erro, message: ''})
        });
});

router.get('/classe/:cid', (req, res) => {
    axios.get('http://clav-test.di.uminho.pt/api/classes/c' + req.params.cid)
        .then(resposta => {
            var classe = resposta.data[0];
            axios.get('http://clav-test.di.uminho.pt/api/classes/c' + req.params.cid + '/descendencia')
                .then(resposta2 => {
                    res.render('classe', {classe: classe, descend: resposta2.data});
                })
                .catch(erro => {
                    res.render('error', {title: 'Erro', error: erro, message: ''});
                })
        })
        .catch(erro => {
            res.render('error', {title: 'Erro', error: erro, message: ''});
        });
});

module.exports = router;
