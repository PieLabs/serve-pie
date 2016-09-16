const fs = require('fs-extra');
const path = require('path');
const logger = require('../../log-factory').fileLogger(__filename);

module.exports = (filepath, config) => {

  logger.debug('write config to: ', filepath);

  fs.ensureDirSync(path.dirname(filepath));

  logger.debug('just writing out the webpack config');
  
  let json = JSON.stringify(config, (key, value) => {
    if (value instanceof RegExp) {
      return '<RE>' + value.source + '</RE>';
    } else {
      return value;
    }
  }, '  ');

  let tweaked = json
    .replace(/"<RE>(.*?)<\/RE>"/g, '/$1/')
    .replace(/\\\\/g, '\\');

  let js = ` 
  module.exports = ${tweaked};
  `;

  fs.writeFileSync(filepath, js, { encoding: 'utf8' });
};