var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');

var jwt = require('jsonwebtoken');
var passport = require('passport');
var uuid = require('uuid/v4');
var session = require('express-session');
var FileStore = require('session-file-store')(session);

require('./auth/auth');
var Config = require('./config').Config;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var itemsRouter = require('./routes/items');
var filesRouter = require('./routes/files');
var usersAPIRouter = require('./routes/api/users');
var itemsAPIRouter = require('./routes/api/items');
var filesAPIRouter = require('./routes/api/files');

var key = 'randomkey';

var app = express();

mongoose.connect(Config.mongoURI, {useNewUrlParser: true})
        .then(() => console.log('Mongo ready: '+ mongoose.connection.readyState))
        .catch(() => console.log('Erro na conexão'));

app.use(session({
    genid: () => { return uuid(); },
    store: new FileStore(),
    secret: key,
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/item', itemsRouter);
app.use('/files', filesRouter);
app.use('/api/users', usersAPIRouter);
app.use('/api/items', itemsAPIRouter);
app.use('/api/files', filesAPIRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    if (err.code == 'EPERM') return;
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
