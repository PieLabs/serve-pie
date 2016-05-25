"use strict";

const _ = require('lodash');
const path = require('path');

module.exports = (pieKeys, bowerComponentsDir)  => {
  
  let logger = require('./log-factory').fileLogger(__filename);
  
  logger.info('read pie processors for: ', _.keys(pieKeys), 'in dir: ', bowerComponentsDir);
  return new Promise((resolve, reject) => {
    let processors = _(pieKeys).keys().map((k) => {
      try {
        let processingPath = path.join(bowerComponentsDir, k, 'processing.js');
        let bowerPath = path.join(bowerComponentsDir, k, 'bower.json');
        let bowerInfo = require(bowerPath);
        return {
          component: {
            name: bowerInfo.name,
            version: bowerInfo.version
          }, 
          processor: require(processingPath)
        }
      } catch(e){
        logger.error(e);
        return null; 
      }
    }).value();
    logger.debug('processors: ', JSON.stringify(processors, null, '  '));
    
    resolve(_.compact(processors));
  });  
}