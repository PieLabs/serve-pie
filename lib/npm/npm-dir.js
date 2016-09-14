const fs = require('fs-extra');
const path = require('path');

function NpmDir(root) {

  const logger = require('../log-factory').fileLogger(__filename);

  logger.debug(`root: ${root}`);
  this.isInstalled = () => {
    logger.silly('isInstalled');
    return false;
  }

  this.writePackageJson = (pies) => {
    let pkg = {
      name: 'tmp',
      version: '0.0.1',
      private: true,
      dependencies: {
        'corespring-pie-es6-demo': '../..'
      }
    };

    fs.writeJsonSync(path.join(root, 'package.json'), pkg);

    return Promise.resolve(pies);
  };

  this.freshInstall = (pies) => {
    return this.writePackageJson(pies)
      .then(this.install);
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
        terminal: true
      }).on('line', function (line) {
        logger.error(line);
      });

      readline.createInterface({
        input: install.stdout,
        terminal: true
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