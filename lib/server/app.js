const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const _ = require('lodash');

module.exports = (logHttpRequests, routers) => {

  "use strict";
  
  const app = express();
  
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');
  
  if(logHttpRequests){
    const serverLogger = require('morgan');
    app.use(serverLogger('dev'));
  }

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));

  _.forEach(routers, (value, key) => {
    app.use(key, value);
  });

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
  
  return app;
};



