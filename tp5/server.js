var http = require('http')
var url = require('url')
var fs = require('fs')
var pug = require('pug')
var path = require('path')

var puburl = /\/obras\//
var jsonfilter = /\.json/
var indexfilter = /index\.json/
var porta = 5000

function checkName(name1, name2) {
    return name1 == name2
}

function gen_index(startPath, index_name){
    if (!fs.existsSync(startPath)){
        return false
    }

    var list = []

    var files = fs.readdirSync(startPath)
    for(var i = 0; i < files.length; ++i){
        var filename = path.join(startPath, files[i])
        var stat = fs.lstatSync(filename);
        if (!stat.isDirectory()){
            if (jsonfilter.test(filename) && !indexfilter.test(filename)){
                var data = fs.readFileSync(filename, 'utf8');
                var obra = JSON.parse(data)
                var com = (obra.compositor == null) ? 'Desconhecido' : obra.compositor
                var comp = list.filter(elem => (elem["compositor"] == com))
                if (comp.length < 1){
                    var dict = {}
                    var ob = {}
                    dict["compositor"] = com
                    ob["_id"] = obra._id
                    ob["titulo"] = obra.titulo
                    dict["obras"] = [ob]
                    list.push(dict)
                } else {
                    var ob = {}
                    ob["_id"] = obra._id
                    ob["titulo"] = obra.titulo
                    comp[0]["obras"].push(ob)
                }
            }
        }
    }
    list.sort((c1, c2) => {
        var cc1 = c1["compositor"]
        var cc2 = c2["compositor"]
        return ((cc1 < cc2) ? -1 : ((cc1 > cc2) ? 1 : 0))
    })
    fs.writeFileSync(path.join(startPath,'index.json'), JSON.stringify(list, null, '\t'))
    return true
}

var app = http.createServer((req,res) => {
    var purl = url.parse(req.url)

    if ((purl.pathname == '/') || (purl.pathname == '/index')){
        res.writeHead(200, {'Content-Type':'text/html'})
        fs.readFile('json/index.json', (erro, dados) => {
            if(!erro){
               res.write(pug.renderFile('index.pug', {ind: JSON.parse(dados)}))
            }
            else{
               res.write('<p><b>Erro: </b> ' + erro + '</p>')
            }
            res.end()
        })
    }
    else if (puburl.test(purl.pathname)){
        var ficheiro = purl.pathname.split('/')[2]
        res.writeHead(200, {'Content-Type':'text/html'})
        fs.readFile('json/' + ficheiro + '.json', (erro, dados) => {
            if (!erro)
                res.write(pug.renderFile('template.pug', {obra: JSON.parse(dados)}))
            else
                res.write('<p><b>Erro: </b>' + erro + '</p>')
            res.end()
        })
    }
    else if (purl.pathname == '/w3.css') {
        res.writeHead(200, {'Content-Type':'text/css'})
        fs.readFile('estilo/w3.css', (erro, dados) => {
            if (!erro)
                res.write(dados)
            else
                res.write('<p><b>Erro: </b> ' + erro + '</p>')
            
            res.end()
        })
    }
    else {
        res.writeHead(200, {'Content-Type': 'text/html'})
        res.write('<p><b>Erro, pedido desconhecido: </b>' + purl.pathname + '</p>')
        res.end()
    }

}).listen(porta, () => {
    console.log('Building Index...')
    if (!gen_index(path.join(__dirname, 'json'))){
        console.log('Path does not exist')
        app.close()
    }
    console.log('Servidor à escuta na porta ' + porta + '...')
})