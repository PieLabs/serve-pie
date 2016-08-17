"use strict";

const bower = require('bower');
const bowerConfig = require('bower-config');
const fileLogger = require('../log-factory').fileLogger;
const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');
const exec = require('child_process').exec;
const ResolutionReport = require('./resolution-report');
const P = require('bluebird');

function BowerDir(dir) {

  let logger = fileLogger(__filename);
  let config = bowerConfig.read(dir);

  let fsResolverPath = path.resolve(__dirname, 'fs-resolver.js');
  logger.debug('fsResolverPath:', fsResolverPath);
  
  let resolutionReportName = '.bower.installed.json';
  let dotInstalled = path.join(dir, resolutionReportName);

  this.components = () => {
    logger.info(path.join(dir, config.directory));
    return path.join(dir, config.directory);
  };

  this.clean = () => {
    logger.debug('[clean]..');

    let paths = [this.components(), dotInstalled];

    let promises = _.map(paths, (p) => {
      return new Promise((resolve, reject) => {
        exec(`rm -rf ${p}`, (err, o, e) => {
          if (err) {
            reject(`rm -rf failed for: ${p}`);
          } else {
            logger.debug(`[clean] ${p}..done`);
            resolve();
          }
        });
      });
    });

    return Promise.all(promises);
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

  this.cleanLocalInstall = (dependencies, resolutions) => {
    return this.clean().then(() => this.localInstall(dependencies, resolutions));
  };

  this.cleanLocalInstallLink = (dependencies, resolutions) => {
    return this.clean()
      .then(() => {
        return this.localInstall(dependencies, resolutions)
          .then((report) => {
            return this.linkDependencies(dependencies, resolutions)
              .then((results) => {
                logger.debug('linkDependencies result', results);
                return Promise.resolve(report);
              });
          });
      });
  };

  /** 
   * link local dependencies defined in the bower file
   *  eg: 
   *  { 'a': '../../' } - will link bower_components/a -> ../../
   * 
   * - if the path is a git repo the linking is skipped.
   * @param a map of dependencies
   * @return a promise of results.
   */
  this.linkDependencies = (dependencies) => {

    let linkPromises = _(dependencies).map((v, k) => {
      if (fs.existsSync(v) && fs.lstatSync(v).isDirectory()) {

        logger.debug(`[linkDependencies], k: ${k}, v: ${v}`);
        return new Promise((resolve, reject) => {
          return this.link(k, v)
            .then((success) => {
              logger.info(success);
              resolve({ key: k, success: success });
            })
            .catch((e) => {
              logger.error(e);
              reject(e);
            });
        });
      } else {
        return null;
      }
    }).compact().value();

    return P.reduce(linkPromises, (acc, result) => {
      console.log(result);
      acc[result.key] = result.success;
      return acc;
    }, {});
  };

  /**
   * link a dependency to the bowerPath
   */
  this.link = (name, bowerPath) => {

    logger.debug(`[link] name: ${name}, ${bowerPath}`);
    return new Promise((resolve, reject) => {
      let desiredPath = path.resolve(bowerPath);
      logger.debug(`[link] [bower link] from dir: ${bower.config.cwd}`);
      let bowerLogger = bower.commands.link(null, null, { cwd: desiredPath });
      bowerLogger
        .on('log', bowerLogHandler.bind(null, '[link]'))
        .on('error', (e) => {
          logger.error(`[link]: ${e.stack}`);
          reject(e);
        })
        .on('end', (linkResult) => {
          logger.info(`[link] linked to: ${JSON.stringify(linkResult)}`);
          if (linkResult.src !== desiredPath) {
            let msg = `Bower linked to ${linkResult.src} but we wanted a link to: ${desiredPath}`;
            logger.error(`[link]  ${msg}`);
            reject(new Error(msg));
          } else {
            logger.silly('[link] success', linkResult.src);
            logger.debug(`[link] link to ${name} - [bower link ${name}], from dir: ${bower.config.cwd}`);
            bower.commands.link(name, null, null, {cwd: dir})
              .on('log', bowerLogHandler.bind(null, `[link ${name}]`))
              .on('error', (e) => {
                logger.error(`[link] > : ${e}`);
                logger.info('[link] - tip: remove all your local bower links and try again `rm -fr ~/.local/share/bower/links/*`');
                reject(e);
              })
              .on('end', () => {
                logger.silly('success', arguments);
                resolve(true);
              });
          }
        });
    });
  };



  let bowerLogHandler = (label, log) => {
    if (_.includes(['action', 'info'], log.level)) {
      logger.silly(label, log.id, log.message);
    }
  };

  /**
   * @param dependencies [{key: path}]
   * 
   * @return Promise<ResolutionReport>
   */
  this.localInstall = (dependencies, resolutions) => {
    resolutions = resolutions || {};
    logger.debug(`[install] ${dependencies}`);

    return new Promise((resolve, reject) => {
      bower.config.cwd = dir;

      let config = {
        name: 'tmp-bower-config',
        version: '1.0.0',
        dependencies: _.cloneDeep(dependencies),
        resolutions: _.cloneDeep(resolutions)
      };

      logger.debug('[localInstall], config: ', JSON.stringify(config, null, '  '));

      let tmpBowerPath = path.join(dir, 'bower.json');
      fs.writeJSONSync(tmpBowerPath, config);

      let fsResolverRelativePath = path.relative(path.resolve(dir), fsResolverPath);
      logger.debug(`fsResolver - relativePath:`, fsResolverRelativePath);
      let bowerLogger = bower.commands.install([], { save: false }, {cwd: dir, resolvers: [fsResolverRelativePath]});

      bowerLogger
        .on('log', bowerLogHandler.bind(null, '[install]'))
        .on('error', (e) => {
          logger.error('error for dir: ', dir, e);
          reject(e);
        })
        .on('end', (installed) => {
          logger.debug(`[install] ${this} - complete`);
          //fs.unlinkSync(tmpBowerPath);
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
