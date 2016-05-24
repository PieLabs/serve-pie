"use strict";

const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');

module.exports = (dir, piePaths) => {
  let logger = require('./log-factory').fileLogger(__filename);
  let file = path.join(dir, 'local-components.json')
  let arr = fs.readJsonSync(file, {throws: false});
  let all = _(arr).concat(piePaths).uniq().value();
  logger.debug('all:', all);
  return all;
};