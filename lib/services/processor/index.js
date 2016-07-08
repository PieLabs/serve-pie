"use strict";

/**
 * @param pieProcessors an array of pie processors: 
 * [ {id: {name: version:}, logic: { createOutcome: function(){}}}, ...]
 */
const _ = require('lodash');
const QuestionBundle = require('./question-bundle');

function Processor(pieProcessors) {

  let logger = require('../../log-factory').fileLogger(__filename);

  let findPieProcessor = (component) => _.find(pieProcessors, (pp) => {
    return component && component.name && pp.component.name === component.name;
  });


  function loadDef(q) {
    let def = findPieProcessor(q.component);
    if (!def) {
      q._def = this.errors.missingComponent(q.component.name);
    } else {
      q._def = def;
    }
    return q;
  }

  function loadSession(sessions, id) {
    return _.find(sessions, { id: id });
  }

  function hasFunction(name, q) {
    if (!q.def || !_.isFunction(q.def[name])) {
      return
    }
  }


  /**
   * Call `state` 
   * 
   * 1. find def w/ function 
   * 2. find session 
   */
  this.state = (questions, sessions, env) => {
    return new Promise((resolve) => {
      let bundles = _(questions)
        .map((q) => new QuestionBundle(q))
        .map((b) => b.withDef(findPieProcessor(b.component), 'state'))
        .map((b) => b.withSession(loadSession(sessions, b.id)));

      let out =  _.map(bundles, (b) => {
        if (b.hasErrors) {
          return b.errorResult
        } else {
          return {
            id: b.id,
            component: b.component,
            state: b.def.processor.state(b.question, b.session, env)
          }
        }
      });
      resolve(out);

    });
  };

  this.createOutcomes = (questions, sessions) => {

    return new Promise((resolve) => {
      let bundles = _(questions)
        .map((q) => new QuestionBundle(q))
        .map((b) => b.withDef(findPieProcessor(b.component), 'createOutcome'))
        .map((b) => b.withSession(loadSession(sessions, b.id)))
        .value();

      let out = _.map(bundles, (b) => {
        if (b.hasErrors) {
          return b.errorResult
        } else {
          logger.debug(`bundle: ${b}`);
          let settings = { highlightUserResponse: true };
          let outcome = b.def.processor.createOutcome(b.question, b.session.response, settings);
          return {
            id: b.id,
            component: b.component,
            outcome: outcome
          }
        }
      });
      resolve(out);

    });
  };

  /*this.createOutcomes = (questions, sessions) => {

    logger.debug('[createOutcomes]', questions, sessions);

    return new Promise((resolve) => {
      let results = _.map(questions, (q) => {
        var def = findPieProcessor(q.component);

        var out = { id: q.id, component: q.component };

        if (!def) {
          return _.extend(out, this.errors.missingComponent(q.component.name));
        } else if (!def.processor || !_.isFunction(def.processor.createOutcome)) {
          return _.extend(out, { error: `This processor is missing the 'createOutcome' function.` });
        } else {
          let session = _.find(sessions, { id: q.id });

          if (!session) {
            return _.extend(out, this.errors.missingSession(q.id));
          } else {
            try {
              let settings = { highlightUserResponse: true };
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
  };*/

  this.clean = (components) => {
    return new Promise((resolve, reject) => {
      let out = _.map(components, (q) => {

        let defaultClean = _.cloneDeep(q);
        delete defaultClean.correctResponse;

        let def = findPieProcessor(defaultClean.component);
        if (!def || !def.processor || !_.isFunction(def.processor.clean)) {
          logger.warn(`can't find a clean function for: ${JSON.stringify(q.component)}`);
          return defaultClean;
        } else {
          let cleaned = def.processor.clean(defaultClean);
          if (!cleaned) {
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