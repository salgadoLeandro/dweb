var express = require('express');
var url = require('url');
var router = express.Router();
var Compositor = require('../../controllers/api/compositor');

router.get('/', (req, res) => {
    var purl = url.parse(req.url, true);
    var query = purl.query;
    Compositor.listarCondicional(query.periodo, query.data)
        .then(dados => res.jsonp(dados))
        .catch(erro => res.status(500).send('Erro na listagem de compositores!'));
});

router.get('/:cid', (req, res) => {
    Compositor.consultar(req.params.cid)
        .then(dados => res.jsonp(dados))
        .catch(erro => res.status(500).send('Erro na consulta de compositor!'));
});

module.exports = router;