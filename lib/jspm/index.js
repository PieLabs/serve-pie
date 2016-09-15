const logger = require('../log-factory').fileLogger(__filename);
const spawn = require('child_process').spawn;
const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');
const EventEmitter = require('events').EventEmitter;

//Going to start with a naive install before digging into the jspm js api.
exports.install = (dir) => {

  fs.removeSync(path.join(dir, 'jspm.config.js'));
  fs.removeSync(path.join(dir, 'jspm_packages'));

  logger.debug('install..., root: ', dir);

  const ui = require('jspm/lib/ui');
  const core = require('jspm/lib/core');
  
  return new Promise((resolve, reject) => {

    emitter = new EventEmitter();
    ui.setResolver(emitter);
    ui.useDefaults(false);
    
    emitter.on('log', (type, msg)=>{
      logger.debug(type, msg);
      if(type === 'err'){
        reject(new Error(msg));
      }
    });

    emitter.on('prompt', (details, cb) => {
      logger.debug(details);
      if(details.type === 'input'){
        cb({ input : details.default});
      } else if(details.type === 'confirm'){
        cb(details.default);
      } else {
        reject(new Error('unknown prompt type: ', details.type));
      }
    })

    core.init(dir)
      .then(() => {
        logger.debug('init completed');
        resolve();
      })
      .catch((err) => {
        logger.error(err)
        reject(err);
      });

  });
}