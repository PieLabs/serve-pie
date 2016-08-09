function EmptyEvents(){
  const logger = require('../../log-factory').fileLogger(__filename);
  this.handle = (event) => {
    logger.info(`[handle] event: ${JSON.stringify(event)}`);
    return Promise.resolve('');
  };
}

module.exports = EmptyEvents;