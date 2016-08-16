const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

module.exports = (logHttpRequests) => {

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
  return app;
};



