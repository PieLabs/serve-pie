function Router(eventService){
  "use strict";
  const express = require('express');
  const router = express.Router(); 
  const logger = require('../../log-factory').fileLogger(__filename);
  const utils = require('./utils');

  router.post('/', (req, res, next) => {
    logger.info('body: ', JSON.stringify(req.body));
    //Just invoke handle - don't wait for a response 
    eventService.handle(req.body, utils.urlFromReferer(req), 'serve-pie-demo')
      .catch((err) => {
        logger.error(err);
      });
      
    res.status(202).send('');
  });

  return router;
}

module.exports = Router;