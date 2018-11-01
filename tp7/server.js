var express = require('express')
var http = require('http')
var pug = require('pug')
var fs = require('fs')
var formidable = require('formidable')
var logger = require('morgan')
var jsonfile = require('jsonfile')

var porta = 4007
var catalogo = 'catalogo.json'
var app = express()

app.use(logger('combined'))

app.get('/', (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
    jsonfile.readFile(catalogo, (erro, ficheiros) => {
        if (!erro) {
            res.write(pug.renderFile('single-page.pug', {lista: ficheiros}))
            res.end()
        }
        else {
            res.write(pug.renderFile('erro.pug', {e: 'Erro na leitura da BD'}))        
            res.end()
        }
    })
})

app.get('/w3.css', (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/css'})
    fs.readFile('stylesheets/w3.css', (erro, dados) => {
        if (!erro) res.write(dados)
        else res.write(pug.renderFile('erro.pug', {e: erro}))
        res.end()
    })
})

app.get('/cScript.js', (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'})
    fs.readFile('cScript.js', (erro, dados) => {
        if (!erro) res.write(dados)
        else res.write(pug.renderFile('erro.pug', {e: erro}))
        res.end()
    })
})

app.get('/jquery-3.3.1.min.js', (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'})
    fs.readFile('jquery-3.3.1.min.js', (erro, dados) => {
        if (!erro) res.write(dados)
        else res.write(pug.renderFile('erro.pug', {e: erro}))
        res.end()
    })
})

app.get('/*', (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'})
    fs.readFile('uploaded' + decodeURI(req.path), (erro, dados) => {
        if (!erro) res.write(dados)
        else res.write(pug.renderFile('erro.pug', {e: erro}))
        res.end()
    })
})

app.post('/', (req, res) => {
    var form = formidable.IncomingForm()
    form.parse(req, (erro, fields, files) => {
        var fenviado = files.ficheiro.path
        var fnovo = './uploaded/' + files.ficheiro.name
        
        fs.rename(fenviado, fnovo, () => {
            fields["nome"] = files.ficheiro.name
            jsonfile.readFile(catalogo, (erro, lista) => {
                if (!erro) {
                    lista.push(fields)
                    jsonfile.writeFile(catalogo, lista, erro => {
                        if (erro) console.log(erro)
                        else console.log('Registo gravado com sucesso.')
                    })
                }
                else {
                    console.log(erro)
                }
            })
            res.writeHead(200)
            res.end()
        })
    })
})

var myServer = http.createServer(app)
myServer.listen(porta, () => {
    console.log('Servidor à escuta na porta ' + porta + '...')
})