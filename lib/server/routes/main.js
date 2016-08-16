function Router(dirname, itemData, resolutionReport, processor) {
  "use strict";
  const path = require('path');
  const fs = require('fs-extra');
  const _ = require('lodash');
  const express = require('express');
  const router = express.Router();
  const logger = require('../../log-factory').fileLogger(__filename);

  
  
  router.get('/', (req, res, next) => {
    res.render('main', {});
  });
  
  return router;
}

module.exports = Router;
