var express = require('express')
var router = express.Router()
var jsonfile = require('jsonfile')
var fs = require('fs')
var formidable = require('formidable')

var myBD = __dirname + '/catalogo.json'

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index');
});

router.get('/lista', (req, res) => {
    jsonfile.readFile(myBD, (erro, files) => {
        if (!erro) res.render('lista', {lista: files})
        else res.render('error', {e: erro})
    })
})

router.post('/lista/guardar', (req, res) => {
    var form = formidable.IncomingForm()
    form.parse(req, (erro, fields, files) => {
        var fenviado = files.ficheiro.path
        var fnovo = './public/uploaded/' + files.ficheiro.name

        fs.rename(fenviado, fnovo, () => {
            fields["nome"] = files.ficheiro.name
            jsonfile.readFile(myBD, (erro, files) => {
                if (!erro) {
                    files.push(fields)
                    jsonfile.writeFile(myBD, files, erro2 => {
                        if (!erro2) console.log('Ficheiro gravado com sucesso')
                        else console.log(erro2)
                    })
                }
                else {
                    console.log(erro)
                }
            })
            res.json(fields)
        })
    })
})

module.exports = router;
