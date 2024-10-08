var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

//CONFIG THE DATABASE
require('./config/database.js');

//CONFIG passport
require('./config/passport.js');

app.use(cors()); //CHANGE to actual origin later

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development

  res.status(err.status || 500);

  let responseToJson = {
    statusSucc: false,
    message: `Status code ${err.status || 500}`,
  };

  if (req.app.get('env') === 'development') {
    responseToJson.err = err;
  }

  res.json(responseToJson);
});

module.exports = app;
