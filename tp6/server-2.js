var http = require('http')
var url = require('url')
var pug = require('pug')
var fs = require('fs')
var jsonfile = require('jsonfile')

var {parse} = require('querystring')

var myBD = "tarefas.json"

var porta = 4006

var myServer = http.createServer((req,res) => {
    var purl = url.parse(req.url, true)
    var query = purl.query

    console.log('Recebi o pedido: ' + purl.pathname)
    console.log('Com o método: ' + req.method)

    if (req.method == 'GET') {
        if (purl.pathname == '/') {
            jsonfile.readFile(myBD, (erro, tarefas) => {
                if (!erro) {
                    res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'})
                    res.write(pug.renderFile('full-page.pug', {lista: tarefas}))
                    res.end()
                }
                else {
                    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                    res.write(pug.renderFile('erro.pug', {e: 'Erro na leitura da BD'}))        
                    res.end()
                }
            })
        } 
        else if (purl.pathname == '/w3.css') {
            res.writeHead(200, {'Content-Type': 'text/css'})
            fs.readFile('stylesheets/w3.css', (erro, dados) => {
                if (!erro) res.write(dados)
                else res.write(pug.renderFile('erro.pug', {e: erro}))
                res.end()
            })
        }
        else {
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
            res.write(pug.renderFile('erro.pug', {e: 'Erro: ' + purl.pathname + ' não está implementado!'}))        
            res.end()        
        }
    }
    else if (req.method == 'POST') {
        if (purl.pathname == '/') {
            recuperaInfo(req, resultado => {
                if (resultado['btn'] == 0){
                    resultado['reg'] = new Date(Date.now())
                    resultado['ongoing'] = true
                    resultado['apagado'] = false
                    console.dir(resultado)
                    jsonfile.readFile(myBD, (erro, tarefas) => {
                        if (!erro) {
                            tarefas.push(resultado)
                            res.end(pug.renderFile('full-page.pug', {lista : tarefas}))
                            jsonfile.writeFile(myBD, tarefas, erro => {
                                if (erro) console.log(erro)
                                else console.log('Registo gravado com sucesso.')
                            })
                        }
                    })
                }
                else {
                    jsonfile.readFile(myBD, (erro, tarefas) => {
                        if (!erro) {
                            var result = tarefas.filter(elem => {
                                return elem['reg'] != resultado['reg']
                            })
                            var tarefa = tarefas.filter(elem => {
                                return elem['reg'] == resultado['reg']
                            })[0]
                            var a = false
                            if (resultado['btn'] == 1){
                                tarefa['apagado'] = true
                                a = true
                            }
                            else if (resultado['btn'] == 2){
                                tarefa['ongoing'] = false
                                a = true
                            }
                            if (a) {
                                if (!result) result = []
                                result.push(tarefa)
                                res.end(pug.renderFile('full-page.pug', {lista : result}))
                                jsonfile.writeFile(myBD, result, erro => {
                                    if (erro) console.log(erro)
                                    else console.log('Registo gravado com sucesso.')
                                })
                            }
                        }
                    })
                }
            })
        }
        else {
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
            res.write(pug.renderFile('erro.pug', {e: 'Erro: ' + purl.pathname + ' não está implementado!'}))        
            res.end()
        }
    }
    else {
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
        res.write(pug.renderFile('erro.pug', {e: 'Método: ' + req.method + ' não suportado!'}))        
        res.end()
    }
})

myServer.listen(porta, () => {
    console.log('Servidor à escuta na porta ' + porta + '...')
})

function recuperaInfo(request, callback) {
    if (request.headers['content-type'] == 'application/x-www-form-urlencoded') {
        let body = ''
        request.on('data', bloco => {
            body += bloco.toString()
        })
        request.on('end', () => {
            callback(parse(body))
        })
    }
    else callback(null)
}