var fs = require('fs');
var mongoose = require('mongoose');
var User = require('./controllers/api/user');
var Item = require('./controllers/api/item');
var File = require('./controllers/api/file');
var Config = require('./config').Config;

var f = process.argv.indexOf('--file');
if (f == -1 || process.argv.length < f + 2 || process.argv.indexOf('-h') > -1 || process.argv.indexOf('--help') > -1) {
    console.log('Usage: node import --file <file>');
    console.log('<file> is the file obtained from previously exporting the database');
    return;
}

mongoose.connect(Config.mongoURI, {useNewUrlParser: true})
        .then(() => {
            console.log('Mongo ready: '+ mongoose.connection.readyState);
            fs.readFile(process.argv[f + 1], (err, data) => {
                if (err) {
                    console.log(err);
                    process.exit(0);
                }
                dados = JSON.parse(data);
                User.insert(dados['users'])
                    .then(() => {
                        Item.import(dados['items'])
                            .then(() => {
                                File.insert(dados['files'])
                                    .then(() => {
                                        console.log('Done.');
                                        process.exit(0);
                                    })
                                    .catch(error => {
                                        console.log(error);
                                        process.exit(-1);
                                    });
                            })
                            .catch(error => {
                                console.log(error);
                                process.exit(-1);
                            });
                    })
                    .catch(error => {
                        console.log(error);
                        process.exit(-1);
                    });
            });
        })
        .catch(() => {
            console.log('Erro na conexão');
            process.exit(-1);
        });

