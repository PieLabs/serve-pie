"use strict";

const bower = require('bower');
const bowerConfig = require('bower-config');
const fileLogger = require('../log-factory').fileLogger;
const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');
const exec = require('child_process').exec;
const ResolutionReport = require('./resolution-report');

function BowerDir(dir) {
  
  let logger = fileLogger(__filename);
  let config = bowerConfig.read(dir);
  let resolutionReportName = '.bower.installed.json'; 
  let dotInstalled = path.join(dir, resolutionReportName);
  
  this.components = () => {
    return path.join(dir, config.directory);
  };

  this.clean = () => {
    logger.debug('[clean]..');
    return new Promise((resolve, reject) => {
      exec(`rm -rf ${this.components()}`, (err, o, e) => {
        if (err) {
          reject(`rm -rf failed for: ${this.components()}`);
        } else {
          logger.debug('[clean]..done');
          resolve();
        }
      });
    });
  };
  
  function buildResolutions(dependencies) {
    return _.reduce(dependencies, (acc, p) => {
      let bowerDef = fs.readJSONSync(path.join(p, 'bower.json'));
      let resolutions = bowerDef.resolutions || {};
      return _.reduce(resolutions, (acc, v, k) => {
        //TODO: always use latest version
        acc[k] = v;
        return acc;
      }, acc);
    }, {});
  }
  
  this.isInstalled = () => {
    let compsExists = fs.existsSync(path.join(dir, config.directory));
    let reportExists = fs.existsSync(dotInstalled);
    return compsExists && reportExists;
  };
  
  this.resolutionReport = () => {
    return ResolutionReport.fromPath(dotInstalled);
  };
   
  this.cleanLocalInstall = (dependencies)=>{
    return this.clean().then(() => this.localInstall(dependencies));
  }; 
  
  /**
   * @param dependencies [{key: path}]
   * 
   * @return Promise<ResolutionReport>
   */
  this.localInstall = (dependencies) => {
    logger.debug(`[install] ${dependencies}`);

    return new Promise((resolve, reject) => {
      bower.config.cwd = dir;
      
      let config = {
        name: 'tmp-bower-config',
        version : '1.0.0',
        dependencies: _.cloneDeep(dependencies)//,
        //resolutions: buildResolutions(dependencies)
      };      
  
      logger.debug('[localInstall], config: ', JSON.stringify(config, null, '  '));

      let tmpBowerPath = path.join(dir, 'bower.json');
      fs.writeJSONSync(tmpBowerPath, config);
           
      let emitter = bower.commands.install([], {save: false}, {});
      
      emitter
        .on('error', (e) => {
          logger.error('error for dir: ', dir, e);
          reject(e);
        })
        .on('end', (installed) => {
          logger.debug(`[install] ${this} - complete`);
          fs.unlinkSync(tmpBowerPath);
          this.installed = installed;
          //TODO: we probably want to write this report to a location within the ppm dir instead
          logger.warn(`[install] write resolution report to ${dotInstalled}`);
          fs.writeJSONSync(dotInstalled, installed, { encoding: 'utf8' });
          let report = ResolutionReport.fromPath(dotInstalled);
          resolve(report);
        });
    });
  };
}

module.exports = BowerDir;
