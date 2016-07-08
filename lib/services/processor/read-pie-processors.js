"use strict";

const _ = require('lodash');
const path = require('path');
const fs = require('fs-extra');
const vm = require('vm');
const ProcessorConsole = require('./console');
/**
 * What libraries may a processing file require?
 */
const validProcessingLibs = {
  lodash: _ 
};

let mockRequire = (name) => {
  if(validProcessingLibs.hasOwnProperty(name)){
    return validProcessingLibs[name];
  } else {
    throw new Error(`Can't find module ${name}`);
  }
};


module.exports = (pieKeys, bowerComponentsDir)  => {
  
  let logFactory = require('../../log-factory');
  let logger = logFactory.fileLogger(__filename);
  
  let relativize = (p) => `./${path.relative(process.cwd(), p)}`;
  
  logger.info('read pie processors for: ', _.keys(pieKeys), 'in dir: ', bowerComponentsDir);
  return new Promise((resolve, reject) => {
    let processors = _(pieKeys).keys().map((k) => {
      try {
        
        let processingPath = path.join(bowerComponentsDir, k, 'processing.js');
        logger.silly(`key: ${k}, processingPath: ${processingPath}`);
        
        let bowerPath = path.join(bowerComponentsDir, k, 'bower.json');
        logger.silly(`key: ${k}, bowerPath: ${bowerPath}`);
        let bowerInfo = fs.readJsonSync(bowerPath);
        let processingSrc = fs.readFileSync(processingPath);
        let script = new vm.Script(processingSrc);
        
        let sandboxedModule = {
          exports: {}
        };

        logger.info(` get sandboxedLogger: ${k}`); 
        let sandboxedLogger = logFactory.getLogger(k);
        let sandboxedConsole = new ProcessorConsole(sandboxedLogger);
        sandboxedConsole.log('!!! log');
        sandboxedConsole.info('!!! info');
        let sandbox = {
          console: sandboxedConsole,
          module: sandboxedModule,
          exports: sandboxedModule.exports,
          require: mockRequire
        };
        
        script.runInNewContext(sandbox);
        
        logger.silly('exports:', sandboxedModule.exports);
      
        if(!_.isFunction(sandboxedModule.exports.createOutcome)) {
          logger.warn(`module: ${processingPath} is missing the 'createOutcome' function`);
        }        
        
        if(!_.isFunction(sandboxedModule.exports.clean)) {
          logger.warn(`module: ${processingPath} is missing the 'clean' function`);
        }        
        
        return {
          component: {
            name: bowerInfo.name,
            version: bowerInfo.version
          }, 
          processor: sandboxedModule.exports 
        };
        
      } catch(e){
        logger.error(e.stack);
        return null; 
      }
    }).value();
    logger.debug('processors: ', JSON.stringify(processors, null, '  '));
    
    resolve(_.compact(processors));
  });  
}