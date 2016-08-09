const EmptyEventHandler = require('./empty');

module.exports = function(path){
  let logger = require('../../log-factory').fileLogger(__filename);
  logger.info(`path: ${path}`);
  return new EmptyEventHandler();
}