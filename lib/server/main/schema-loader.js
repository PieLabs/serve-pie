const fs = require('fs-extra');
const glob = require("glob");
const _ = require('lodash');

module.exports = (dir) => {
  let logger = require('../../log-factory').fileLogger(__filename);
  logger.info(`load schemas in path: ${dir}`);
  let files = glob.sync(`${dir}/**/*.json`);
  logger.debug('files:', files);
  return _.map(files, (f) => fs.readJSONSync(f));
};