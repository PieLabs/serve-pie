/**
 * @param processor - the processor
 * @param components - the component question array
 */

const _ = require('lodash');

function Router(processor, loadComponents){
  const express = require('express');
  const router = express.Router();
  const logger = require('../../log-factory').fileLogger(__filename);

  router.put('/model', (req, res, next) => {
    
    logger.debug('/model', req.body);
    
    //pull in the complete question model here
    let fullQuestions = _.map(req.body.questions, (q) => {
      return _.find(loadComponents(), {id: q.id});
    });
    
    processor.model(fullQuestions || [], req.body.sessions || [], req.body.env)
      .then((models) => {
        logger.debug('/model', models);
        res.json(models);       
      })
      .catch((err) => {
        logger.error('/model', err.stack);
        res.status(500).json({error: err.message});
      });
  });
  
  return router; 
}

module.exports = Router;