var http = require('http')
var url = require('url')
var fs = require('fs')

http.createServer((req, res) => {
    var purl = url.parse(req.url, true)
    res.writeHead(200, {'Content-Type': 'text/html'})
    var filename = purl.pathname.split('/')[2]
    fs.readFile('website/' + (((filename == 'index') || purl.pathname == '/') ? 'index.html' : 'html/' + filename + '.html'), (erro, dados) => {
        if (!erro)
            res.write(dados)
        else
            res.write('<p><b>ERRO: </b>' + erro + '</p>')
        res.end()
    })
}).listen(4000, () => {
    console.log('Servidor à escuta na porta 4000...')
})