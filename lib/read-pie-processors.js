"use strict";

const _ = require('lodash');
const path = require('path');
const SandboxedModule = require('sandboxed-module');

module.exports = (pieKeys, bowerComponentsDir)  => {
  
  let logger = require('./log-factory').fileLogger(__filename);
  
  let relativize = (p) => `./${path.relative(process.cwd(), p)}`;
  
  logger.info('read pie processors for: ', _.keys(pieKeys), 'in dir: ', bowerComponentsDir);
  return new Promise((resolve, reject) => {
    let processors = _(pieKeys).keys().map((k) => {
      try {
        let processingPath = relativize(path.join(bowerComponentsDir, k, 'processing'));
        let bowerPath = path.join(bowerComponentsDir, k, 'bower');
        let bowerInfo = require(bowerPath);
        const _ = require('lodash');
        
        var SandboxedModule = require('sandboxed-module');
        
        // let testPath = `./${path.relative(process.cwd(), path.join(bowerComponentsDir, '../a'))}`;
        // console.log('testPath: ', testPath) ;
        // var a = SandboxedModule.require(testPath, {
        //   requires: {'lodash': require('lodash') }
        // });
        // console.log(a);
        // console.log('lodash: ', _, _.map([1,3], (n) => n + 1));       
        let sandboxedProcessor = SandboxedModule.load(processingPath, {
          requires: {
            'lodash': _ 
          }
        });
          
        return {
          component: {
            name: bowerInfo.name,
            version: bowerInfo.version
          }, 
          processor: sandboxedProcessor
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