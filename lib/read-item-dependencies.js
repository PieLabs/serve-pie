'use strict';

const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');
const semver = require('semver');



module.exports = (dir) => {
  let logger = require('./log-factory').fileLogger(__filename);
  let file = path.join(dir, 'dependencies.json');
  logger.silly('file:', file);

  let root = fs.readJsonSync(file, { throws: true }) || {};
  logger.silly('root: ', JSON.stringify(root));
  logger.debug('deps:', root.dependencies);

  let isGitUrl = (str) => {
    var re = /(?:git|ssh|https?|git@[\w\.]+):(?:\/\/)?[\w\.@:\/~_-]+\.git(?:\/?|\#[\d\w\.\-/_]+?)$/;
    return re.test(str);
  };

  let isSemver = (str) => {
    return semver.valid(str) !== null;
  };

  let relativize = (acc, v, key) => {
    if (isGitUrl(v) || isSemver(v)) {
      acc[key] = v;
    } else {
      try {
        let resolved = path.resolve(dir, v);
        let stat = fs.lstatSync(resolved);
        if (stat.isDirectory()) {
          acc[key] = resolved;
        }
      } catch (e) {
        logger.error(`Can't find path: ${v} for component: ${key}`);
        logger.silly(e.stack);
      }
    }
    return acc;
  };

  let relativised = _.reduce(root.dependencies, relativize, {});
  return relativised;
};