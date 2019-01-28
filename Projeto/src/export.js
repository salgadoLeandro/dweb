var fs = require('fs');
var mongoose = require('mongoose');
var User = require('./controllers/api/user');
var Item = require('./controllers/api/item');
var File = require('./controllers/api/file');
var Config = require('./config').Config;

mongoose.connect(Config.mongoURI, {useNewUrlParser: true})
        .then(() => {
            console.log('Mongo ready: '+ mongoose.connection.readyState);
            var collections = {};

            User.list()
                .then(data => {
                    collections['users'] = data;
                    console.log('Users done.');
                    Item.list()
                        .then(data => {
                            collections['items'] = data;
                            console.log('Items done.');
                            File.list()
                                .then(data => {
                                    collections['files'] = data;
                                    console.log('Files done.');
                                    fs.writeFile('export.json', JSON.stringify(collections, null, 4), () => {
                                        console.log('All done.');
                                        process.exit(0);
                                    });
                                })
                                .catch(error => console.log(error));
                        })
                        .catch(error => console.log(error));
                })
                .catch(error => console.log(error));
        })
        .catch(() => console.log('Erro na conexão'));

