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

const CONTROLLER_NAME = 'controller.js';
const OLD_CONTROLLER_NAME = 'processing.js';

let mockRequire = (name) => {
  if (validProcessingLibs.hasOwnProperty(name)) {
    return validProcessingLibs[name];
  } else {
    throw new Error(`Can't find module ${name}`);
  }
};


module.exports = (pieKeys, bowerComponentsDir) => {

  let logFactory = require('../../log-factory');
  let logger = logFactory.fileLogger(__filename);

  let relativize = (p) => `./${path.relative(process.cwd(), p)}`;


  logger.info('read pie processors for: ', _.keys(pieKeys), 'in dir: ', bowerComponentsDir);
  return new Promise((resolve, reject) => {
    let processors = _(pieKeys).keys().map((k) => {
      try {
        
        let loadProcessingModule = () => {
          let dir = path.join(bowerComponentsDir, k);
          let processingPath = path.join(dir, CONTROLLER_NAME);
          let oldProcessingPath = path.join(dir, OLD_CONTROLLER_NAME);
          if (fs.existsSync(processingPath)) {
            return {src: fs.readFileSync(processingPath), path: processingPath};
          } if (fs.existsSync(oldProcessingPath)) {
            logger.warn(`Using old name of controller.js for ${dir} - rename processing.js to controller.js`);
            return {src: fs.readFileSync(oldProcessingPath), path: oldProcessingPath};
          } else {
            throw new Error(`no controller.js or processing.js found in path: ${dir}`);
          }
        };

        let bowerPath = path.join(bowerComponentsDir, k, 'bower.json');
        logger.silly(`key: ${k}, bowerPath: ${bowerPath}`);
        let bowerInfo = fs.readJsonSync(bowerPath);
        let processingModule = loadProcessingModule();
        let script = new vm.Script(processingModule.src);

        let sandboxedModule = {
          exports: {}
        };

        logger.info(`get sandboxedLogger: ${k}`);

        let sandboxedLogger = logFactory.getLogger(k);
        let sandboxedConsole = new ProcessorConsole(sandboxedLogger);

        let sandbox = {
          console: sandboxedConsole,
          module: sandboxedModule,
          exports: sandboxedModule.exports,
          require: mockRequire
        };

        script.runInNewContext(sandbox);

        if (!_.isFunction(sandboxedModule.exports.clean)) {
          logger.warn(`module: ${processingModule.path} is missing the 'clean' function`);
        }

        return {
          component: {
            name: bowerInfo.name,
            version: bowerInfo.version
          },
          processor: sandboxedModule.exports
        };

      } catch (e) {
        logger.error(e.stack);
        return null;
      }
    }).value();
    logger.debug('processors: ', JSON.stringify(processors, null, '  '));

    resolve(_.compact(processors));
  });
};