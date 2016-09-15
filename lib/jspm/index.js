const logger = require('../log-factory').fileLogger(__filename);
const spawn = require('child_process').spawn;
const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');
const jspmCore = require('jspm/lib/core');
const jspmUi = require('jspm/lib/ui');

//Going to start with a naive install before digging into the jspm js api.
exports.install = (dir) => {

  fs.removeSync(path.join(dir, 'jspm.config.js'));
  fs.removeSync(path.join(dir, 'jspm_packages'));

  logger.debug('install..., root: ', dir);

  return new Promise((resolve, reject) => {
    jspmUi.setResolver();
    jspmUi.useDefaults(false);
    
    process.env.jspmConfigPath = path.resolve(dir, 'package.json');
    
    fs.copySync(
      path.join(__dirname, '_resources', 'jspm.config.js'), 
      path.join(dir, 'jspm.config.js'));

    return jspmCore.checkDlLoader()
      .then(() => {
        logger.debug('dl completed..')
        resolve();
      })
      .catch(reject);
  });
}