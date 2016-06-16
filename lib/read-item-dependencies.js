"use strict";

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

  let isRemoteGit = (v) => {
    return v.startsWith('git');
  };

  let isSemver = (v)  => {
    return semver.valid(v) !== null;
  };

  let relativize = (acc, v, key) => {
    if (isRemoteGit(v) || isSemver(v)) {
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