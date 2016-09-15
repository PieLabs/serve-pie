const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');

function NpmDir(root) {

  const logger = require('../log-factory').fileLogger(__filename);

  logger.debug(`root: ${root}`);
  this.isInstalled = () => {
    logger.silly('isInstalled');
    return false;
  }

  this.writePackageJson = (pies) => {

    logger.silly('pies: ', pies);
    let dependencies = _.mapValues(pies, (v, k) => {
      return path.relative(root, v)
    });

    logger.silly('generated dependencies: ', dependencies);
    let pkg = {
      name: 'tmp',
      version: '0.0.1',
      private: true,
      dependencies: dependencies
    };

    fs.writeJsonSync(path.join(root, 'package.json'), pkg);

    return Promise.resolve(pies);
  };

  this.freshInstall = (pies) => {
    fs.removeSync(path.join(root, 'node_modules'));

    return this.writePackageJson(pies);
      //.then(this.install);
  };

  this.install = (pies) => {
    logger.silly('install');

    const spawn = require('child_process').spawn;
    const readline = require('readline');

    let p = new Promise((resolve, reject) => {

      let install = spawn('npm', ['install'], { cwd: root });

      install.on('error', () => {
        logger.error('npm install command failed - is npm installed?');
        reject();
      });

      readline.createInterface({
        input: install.stderr,
        terminal:false 
      }).on('line', function (line) {
        logger.error(line);
      });

      readline.createInterface({
        input: install.stdout,
        terminal:false 
      }).on('line', function (line) {
        logger.info(line);
      });

      install.on('close', (code) => {
        if (code !== 0) {
          logger.err('install failed. code: ' + code);
          reject();
        } else {
          resolve();
        }
      });
    });

    return p;
  }
}

module.exports = NpmDir;