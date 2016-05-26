/**
 * @param processor - the processor
 * @param components - the component question array
 */

const _ = require('lodash');

function Router(processor, components){
  const express = require('express');
  const router = express.Router();
  const logger = require('../../log-factory').fileLogger(__filename);
  
  router.post('/outcomes', (req, res, next) => {
    logger.debug('/outcomes', req.body);
    
    //pull in the complete question model here
    let fullQuestions = _.map(req.body.questions, (q) => {
      return _.find(components, {id: q.id});
    });
    
    processor.createOutcomes(fullQuestions || [], req.body.sessions || [])
      .then((outcomes) => {
        logger.debug('/outcomes', outcomes);
        res.json(outcomes);       
      })
      .catch((err) => {
        res.status(500).json({error: err.message});
      });
  });
  
  return router; 
}

module.exports = Router;