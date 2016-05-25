/**
 * @param pieProcessors an array of pie processors: 
 * [ {id: {name: version:}, logic: { createOutcome: function(){}}}, ...]
 */

const _ = require('lodash');

function Processor(pieProcessors) {

  let logger = require('../log-factory').fileLogger(__filename);

  let findPieProcessor = (component) => _.find(pieProcessors, (pp) => {
    return component.name && pp.component.name === component.name;
  });

  this.createOutcomes = (questions, sessions) => {

    logger.debug('[createOutcomes]', questions, sessions);

    return new Promise((resolve) => {
      let results = _.map(questions, (q) => {
        var def = findPieProcessor(q.component);

        var out = { id: q.id, component: q.component };

        if (!def) {
          return _.extend(out, {
            error: `Can't find processor for: ${q.component.name}`
          });
        } else if (!def.processor || !_.isFunction(def.processor.createOutcome)) {
          return _.extend(out, { error: `This processor is missing the 'createOutcome' function.` });
        } else {
          let session = _.find(sessions, { id: q.id });

          if (!session) {
            return _.extend(out, {
              error: `Can't find session with matching id`
            });
          } else {
            try {
              let settings = {highlightUserResponse: true};
              let outcome = def.processor.createOutcome(q, session.response, settings);
              return _.extend(out, { outcome: outcome });
            } catch (e) {
              logger.error(e.stack);
              return _.extend(out, { error: e.message });
            }
          }
        }
      });
      resolve(results);
    });
  };
  
  this.clean = (components) => {
    return new Promise((resolve, reject) => {
      let out = _.map(components, (q) => {
        
        let defaultClean = _.cloneDeep(q);
        delete defaultClean.correctResponse;
        
        let def = findPieProcessor(defaultClean.component);
        if(!def || !def.processor || !_.isFunction(def.processor.clean)){
          logger.warn(`can't find a clean function for: ${q.component.name}`);
          return defaultClean;
        } else {
          let cleaned = def.processor.clean(defaultClean);
          if(!cleaned){
            logger.warn('clean returned nothing');
            return defaultClean;
          } else {
            return cleaned;
          }
        }
      }); 
      
      resolve(out);
    });
  };
}

module.exports = Processor;