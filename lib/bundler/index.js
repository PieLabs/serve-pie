const webpackBundler = require('./webpack-bundler');
const logger = require('../log-factory').fileLogger(__filename);
const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');

let createEntryPoint = (root, pies) => {
  logger.debug(`createEntryPoint, root: ${root}, pies: ${pies}`);

  debugger;

  let registerLogic = (value, index) => {
    return `
    // ${value} ${index}
    import comp${index} from '${value}';
    document.registerElement('${value}', comp${index});
    `;
  }
  let js = _(pies).keys().map(registerLogic).value().join('\n');

  let entryPath = path.join(root, 'entry.js');
  fs.writeFileSync(entryPath, js, {encoding: 'utf8'});
  return entryPath;
}

exports.bundle = (root, pies) => {
  logger.debug(`bundle, root: ${root}, pies: ${pies}`);
  let entrypoint = createEntryPoint(root, pies);
  return webpackBundler.bundle(root, entrypoint);
}