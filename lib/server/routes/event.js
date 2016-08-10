function Router(eventService){
  "use strict";
  const express = require('express');
  const router = express.Router(); 
  const logger = require('../../log-factory').fileLogger(__filename);
  const utils = require('./utils');

  router.post('/', (req, res, next) => {
    logger.info('body: ', JSON.stringify(req.body));

    //Do we need to wait for the handle value - can we just fire-and-forget?
    eventService.handle(req.body, utils.fullUrl(req), 'serve-pie-demo')
    res.status(202).send('');
  });

  return router;
}

module.exports = Router;