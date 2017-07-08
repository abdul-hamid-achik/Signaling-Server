var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
require('neon')
require('./lib/lithium/neon.li_patch');
require('./lib/lithium/lithium');

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);




// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

Li.Engine.error.push(function(data) {
    var errorData = [
        'Lithium Detected an Error on ',
        data.scope.className,
        ' on method  ',
        data.spy.methodName,
        ' with message  ',
        data.error.message
    ];
    console.error(errorData.join(' '));
    console.error(data.error.stack);
})
// Li.Engine.before.push(function(data) {

//     var beforeData = [
//         "Context: ",
//         data.scope.className,
//         " Method: ",
//         data.spy.methodName,
//         " Message: ",
//         data.message
//     ]
//     console.log(beforeData.join(' '));
//     // console.log(data)
//     // console.error(data.error.stack);
// })
Li.Engine.after.push(function(data) {
    console.log("Executed: " + (data.spy.targetObject.className || data.spy.targetObject.constructor.className) + '.' + data.spy.methodName + ' on ' + data.time);
})
module.exports = app;