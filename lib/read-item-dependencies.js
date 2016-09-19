'use strict';

const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');
const semver = require('semver');
const helper = require('./npm/dependency-helper');

module.exports = (dir) => {
  let logger = require('./log-factory').fileLogger(__filename);
  let file = path.join(dir, 'dependencies.json');

  if(!fs.existsSync(file)){
    throw new Error(`cant find a dependencies.json file here ${file}`);
  }

  let root = fs.readJsonSync(file, {throws: true}) || {};

  logger.silly('root: ', JSON.stringify(root));
  logger.silly('deps:', root.dependencies);

  let relativize = (acc, v, key) => {
    if (helper.isGitUrl(v) || helper.isSemver(v)) {
      acc[key] = v;
    } else if(helper.pathIsDir(dir, v)) {
      let resolved = path.resolve(dir, v);
      acc[key] = resolved;
    }
    return acc;
  };

  let relativised = _.reduce(root.dependencies, relativize, {});
  return relativised;
};