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

    if (req.method == 'GET'){
        if ((purl.pathname == '/') || (purl.pathname == '/index')){
            res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'})
            res.write(pug.renderFile('index.pug'))
            res.end()
        }
        else if (purl.pathname == '/registo') {
            res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'})
            res.write(pug.renderFile('form-tarefa.pug'))
            res.end()
        }
        else if (purl.pathname == '/lista') {
            jsonfile.readFile(myBD, (erro, tarefas) => {
                if (!erro) {
                    res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'})
                    res.write(pug.renderFile('lista-tarefas.pug', {lista: tarefas}))
                    res.end()
                }
                else {
                    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                    res.write(pug.renderFile('erro.pug', {e: 'Erro na leitura da BD'}))        
                    res.end()
                }
            })
        }else if (purl.pathname == '/processaForm') {
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
            res.write(pug.renderFile('tarefa-recebida.pug', {tarefa: query}))
            res.end()
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
        if (purl.pathname == '/processaForm') {
            recuperaInfo(req, resultado => {
                resultado['reg'] = new Date(Date.now())
                resultado['ongoing'] = true
                resultado['apagado'] = false
                console.dir(resultado)
                jsonfile.readFile(myBD, (erro, tarefas) => {
                    if (!erro) {
                        tarefas.push(resultado)
                        jsonfile.writeFile(myBD, tarefas, erro => {
                            if (erro) console.log(erro)
                            else console.log('Registo gravado com sucesso.')
                        })
                    }
                })
                res.end(pug.renderFile('tarefa-recebida.pug', {tarefa : resultado}))
            })
        } 
        else if (purl.pathname == '/apaga') {
            recuperaInfo(req, resultado => {
                jsonfile.readFile(myBD, (erro, tarefas) => {
                    if (!erro) {
                        var res = tarefas.filter(elem => {
                            return elem['reg'] != resultado['reg']
                        })
                        var tarefa = tarefas.filter(elem => {
                            return elem['reg'] == resultado['reg']
                        })[0]
                        tarefa['apagado'] = true
                        res.push(tarefa)
                        jsonfile.writeFile(myBD, res, erro => {
                            if (erro) console.log(erro)
                            else console.log('Registo gravado com sucesso.')
                        })
                    }
                })
                res.end(pug.renderFile('sucesso.pug', {e: 'Tarefa removida com sucesso.'}))
            })
        }
        else if (purl.pathname == '/termina'){
            recuperaInfo(req, resultado => {
                jsonfile.readFile(myBD, (erro, tarefas) => {
                    if (!erro) {
                        var res = tarefas.filter(elem => {
                            return elem['reg'] != resultado['reg']
                        })
                        var tarefa = tarefas.filter(elem => {
                            return elem['reg'] == resultado['reg']
                        })[0]
                        tarefa['ongoing'] = false
                        if (!res) res = []
                        res.push(tarefa)
                        jsonfile.writeFile(myBD, res, erro => {
                            if (erro) console.log(erro)
                            else console.log('Registo gravado com sucesso.')
                        })
                    }
                })
                res.end(pug.renderFile('sucesso.pug', {e: 'Tarefa terminada com sucesso.'}))
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