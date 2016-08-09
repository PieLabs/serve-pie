function Router(eventService){
  "use strict";
  const express = require('express');
  const router = express.Router(); 
  const logger = require('../../log-factory').fileLogger(__filename);

  router.post('/', (req, res, next) => {
    logger.info('body: ', JSON.stringify(req.body));

    //Do we need to wait for the handle value - can we just fire-and-forget?
    eventService.handle(req.body)
      .then((result) => {
        logger.debug('result: ', result);
        res.status(202).send('');
      })
      .catch(next);
  });

  return router;
}

module.exports = Router;