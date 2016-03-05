var express = require('express');
var app = express();
var server = require('http').createServer(app);
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var swig = require('swig');
var path = require('path');
var passport = require('passport');
var morgan = require('morgan');
var session = require('express-session');
var flash = require('connect-flash');
var favicon = require('serve-favicon');
var setup = require('./lib/setup');

// setup database
setup.setupdb();

//passport configuration
require('./config/passport')(passport);

// setup swig template
swig.setDefaults({cache: false});
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

// other settings
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(morgan('dev'));
app.use(cookieParser());

// setup browser icon
app.use(favicon(__dirname + '/public/favicon.ico'));

// required for passport
app.use(session({secret: 'corate-session'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// get routes
require('./routes/index')(app, passport);
require('./routes/user')(app, passport);
require('./routes/quote')(app, passport);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// start server
server.listen(3000, function(){
  var host = server.address().address;
  var port = server.address().port;
  console.log("listening at http://%s:%s", host, port);
});