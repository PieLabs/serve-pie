"use strict";

/**
 * @param pieProcessors an array of pie processors: 
 * [ {id: {name: version:}, logic: { createOutcome: function(){}}}, ...]
 */
const _ = require('lodash');
const QuestionBundle = require('./question-bundle');

function Processor(pieProcessors, dispatchEvent) {

  dispatchEvent = dispatchEvent || function(){}
  
  let logger = require('../../log-factory').fileLogger(__filename);

  let findPieProcessor = (component) => _.find(pieProcessors, (pp) => {
    return component && component.name && pp.component.name === component.name;
  });

  function loadSession(sessions, id) {
    return _.find(sessions, { id: id });
  }

  /**
   * Call `state` 
   * This is an experiment in allowing `processors` take 
   * more control on the ui model the send to their corresponding component.
   */
  this.state = (questions, sessions, env) => {
    return new Promise((resolve) => {
      let bundles = _(questions)
        .map((q) => new QuestionBundle(q))
        .map((b) => b.withDef(findPieProcessor(b.component), 'state'))
        .map((b) => b.withSession(loadSession(sessions, b.id)))
        .value();

          
      let out = _.map(bundles, (b) => {
        logger.debug(`bundle: ${b.hasErrors}`);
        if (b.hasErrors) {
          return b.errorResult
        } else {
          
          logger.silly(`bundle: ${b}`);

          return {
            id: b.id,
            component: b.component,
            state: b.def.processor.state(
              _.cloneDeep(b.question), 
              b.session, 
              env,
              dispatchEvent)
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

  this.clean = (questions) => {
    return new Promise((resolve, reject) => {

      let bundles = _(questions)
        .map((q) => new QuestionBundle(q))
        .map((b) => b.withDef(findPieProcessor(b.component), 'createOutcome'))
        .value();

      let out = _.map(bundles, (b) => {
        let defaultClean = _.cloneDeep(b.question);
        delete defaultClean.correctResponse;
        if (b.hasErrors) {
          return defaultClean;
        } else {
          logger.debug(`bundle: ${b}`);
          return b.def.processor.clean(defaultClean);
        }
      });
      resolve(out);
    });
  }
}

module.exports = Processor;