function ProcessorConsole(logger){
  this.info = logger.info;
  this.log = logger.info;
  this.debug = logger.debug;
  this.warn = logger.warn;
}

module.exports = ProcessorConsole;