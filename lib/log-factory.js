var winston = require('winston');
var path = require('path');
var _ = require('lodash');
var fs = require('fs-extra');

var config = {
  'default': 'info'
};

exports.init = function (log) {
  if (!log) {
    return;
  }
  if (this.isLogLevel(log)) {
    this.setDefaultLevel(log);
  } else {
    try {
      let config = JSON.parse(log);
      this.setConfig(config);
    } catch (e) {
      if (fs.existsSync(log)) {
        this.setConfigFromFile(log);
      } else {
        console.error('can not configure logging using cli param value: ' + argv.log);
      }
    }
  }
  console.log('log-config:', JSON.stringify(config));
};

function addLogger(label, level) {

  if (winston.loggers.has(label)) {
    return winston.loggers.get(label);
  } else {

    level = level ? level : config['default'] || 'info';

    var logger = winston.loggers.add(label, {
      console: {
        colorize: true,
        label: label,
        level: level
      }
    });
    logger.cli();
    return logger;
  }
}


exports.isLogLevel = function (l) {
  return _.includes(['error', 'warn', 'info', 'verbose', 'debug', 'silly'], l);
};

exports.setDefaultLevel = function (l) {
  config = config || {};
  config['default'] = l;
};

exports.setConfigFromFile = function (configPath) {
  var cfg = fs.readJsonSync(configPath);
  console.log(cfg);
  this.setConfig(cfg);
};

exports.setConfig = function (cfg) {
  config = cfg;
  _.forIn(cfg, (value, key) => {
    addLogger(key, value);
  });
};

exports.getLogger = function (id) {
  var existing = winston.loggers.has(id);

  if (existing) {
    return winston.loggers.get(id);
  } else {
    return addLogger(id);
  }
};

exports.fileLogger = function (filename) {
  var label;
  var parsed = path.parse(filename);

  if (parsed.name === 'index') {
    label = path.basename(parsed.dir);
  } else {
    label = parsed.name;
  }
  return this.getLogger(label);
}.bind(this);

