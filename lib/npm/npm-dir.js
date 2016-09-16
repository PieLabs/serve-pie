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


    /**  
     * TODO:
     * To get the babel compilation running we need to add the babel 
     * dependencies to the demo pkg. It would be preferable to load these in from 
     * serve-pie, but it's not clear how to configure the loader to use serve-pie's 
     * dependencies.
     */

    dependencies['babel-preset-react'] = '^6.11.1';
    dependencies['babel-preset-es2015'] = '^6.14.0';

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
  
  this.writeBabelRc = () => {
    let babelrc = {
      presets: ['es2015', 'react']
    };

    fs.writeJsonSync(path.join(root, '.babelrc'), babelrc, {encoding: 'utf8'});
    return Promise.resolve(); 
  };

  this.freshInstall = (pies) => {
    fs.removeSync(path.join(root, 'node_modules'));
    fs.removeSync(path.join(root, 'package.json'));
    fs.removeSync(path.join(root, '.babelrc'));

    return this.writePackageJson(pies)
      .then(this.writeBabelRc)
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