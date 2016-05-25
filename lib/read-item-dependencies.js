"use strict";

const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');

module.exports = (dir) => {
  let logger = require('./log-factory').fileLogger(__filename);
  let file = path.join(dir, 'dependencies.json')
  let root = fs.readJsonSync(file, {throws: false}) || {};
  logger.debug('deps:', root.dependencies);
  return root.dependencies || {};
};