const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');
const semver = require('semver');
const spawn = require('child_process').spawn;
const readline = require('readline');
const helper = require('./dependency-helper');

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
    fs.removeSync(path.join(root, 'package.json'));

    return this.writePackageJson(pies)
      .then(this.install)
      .then(() => this.linkLocalPies(pies));
  };

  let linkPromise = (p) => spawnPromise(['link', p]);

  this.linkLocalPies = (pies) => {

    let localOnlyDependencies = _.pickBy(pies, (v) => {
      return !helper.isSemver(v) && !helper.isGitUrl(v) && helper.pathIsDir(root,v);
    });

    let out = _.values(localOnlyDependencies).reduce((acc, p) => {
      return acc.then(() => linkPromise(path.relative(root, p)));
    }, Promise.resolve());
    return out;
  };


  let spawnPromise = (args) => {

    logger.info('spawn promise: args: ', args);

    let p = new Promise((resolve, reject) => {

      let s = spawn('npm', args, { cwd: root });

      s.on('error', () => {
        logger.error('npm install command failed - is npm installed?');
        reject();
      });

      readline.createInterface({
        input: s.stderr,
        terminal: false
      }).on('line', function (line) {
        logger.error(line);
      });

      readline.createInterface({
        input: s.stdout,
        terminal: false
      }).on('line', function (line) {
        logger.info(line);
      });

      s.on('close', (code) => {
        if (code !== 0) {
          logger.error(args + ' failed. code: ' + code);
          reject();
        } else {
          resolve();
        }
      });
    });

    return p;
  };

  this.install = (pies) => {
    logger.silly('install');
    return spawnPromise(['install']);
  }
}

module.exports = NpmDir;