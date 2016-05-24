function Server(root, itemData, resolutionReport){
  
  "use strict";
  
  const express = require('express');
  const path = require('path');
  const serverLogger = require('morgan');
  const bodyParser = require('body-parser');
  const lessMiddleware = require('less-middleware');
  
  const app = express();
  const logger = require('../log-factory').fileLogger(__filename);
  
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');
  app.use(serverLogger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(lessMiddleware(path.join(__dirname, 'public'), {debug: true}));
  app.use(express.static(path.join(__dirname, 'public')));

  let bowerCompsDir = path.join(root, 'bower_components');
  logger.debug('bowerCompsDir:', bowerCompsDir);
   
  app.use('/bower_components', express.static(bowerCompsDir));
  
  
  //wire in server client components  
  app.use('/components', express.static(path.join(__dirname, 'components')));
  
  let SampleItemRoutes = require('./routes/sample-item');
  app.use('/', new SampleItemRoutes(path.basename(root), itemData, resolutionReport));

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
}

module.exports = Server;
