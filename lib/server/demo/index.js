const express = require('express');
const path = require('path');
const readPieProcessors = require('../../services/processor/read-pie-processors');
const ItemData = require('../../item-data');
const BowerDir = require('../../bower/bower-dir');
const _ = require('lodash');
const Processor = require('../../services/processor');
const fs = require('fs-extra');

module.exports = (opts) => {

  const logger = require('../../log-factory').fileLogger(__filename);

  logger.info('init router...');
  
  let pies = require('../../read-item-dependencies')(opts.root);
  let resolutions = (fs.readJsonSync(opts.root + '/dependencies.json', { throws: false }) || {}).resolutions;
  
  logger.silly('pies:', pies);

  let configureRouter = (itemData, resolutionReport, pieProcessors) => {
    let router = express.Router();
    const lessMiddleware = require('less-middleware');

    logger.info('opts.root:', opts.root);
    router.use(lessMiddleware(path.join(__dirname, 'public'), { debug: false }));
    router.use(express.static(path.join(__dirname, 'public')));
    router.use('/public', express.static(path.join(opts.root, 'public')));

    let bowerCompsDir = path.join(opts.root, 'bower_components');
    logger.debug('bowerCompsDir:', bowerCompsDir);

    router.use('/bower_components', express.static(bowerCompsDir));

    let Page = require('./page');
    let ProcessRoutes = require('./process');

    let processor = new Processor(pieProcessors)
    
    let page = new Page(
      opts.root,
      itemData,
      resolutionReport,
      processor,
      opts.addAccessibilityComponents);

    let processRoutes = new ProcessRoutes(
      processor,
      () => itemData.json.components);

    router.use('/', page);
    router.use('/process', processRoutes);
    return router;
  };

  let loadItem = (root, name) => {

    let itemData = new ItemData(root, name);
    let componentNames = _.map(itemData.json.components, 'component.name');
    let missingDependencies = _.filter(componentNames, (cn) => {
      return pies[cn] === undefined;
    });

    if (missingDependencies.length > 0) {
      throw new Error('missing dependency for: ' + JSON.stringify(missingDependencies));
    }
    return itemData;
  };

  let itemData = loadItem(opts.root, 'index');
  let bowerDir = new BowerDir(opts.root);

  let runBowerInstall = () => {
    if (bowerDir.isInstalled() && !opts.fullInstall) {
      return Promise.resolve(bowerDir.resolutionReport());
    } else {
      
      let extraComponents = {};

      extraComponents['control-panel'] = 'git@github.com:PieLabs/control-panel.git';
      extraComponents['pie-env-editor'] = 'git@github.com:corespring/pie-env-editor.git';
      
      if(opts.addAccessibilityComponents){
        extraComponents.masking = 'git@bitbucket.org:pielibs/masking.git';
        extraComponents['popup-glossary'] = 'git@bitbucket.org:pielibs/popup-glossary.git';
        extraComponents.highlighter = 'git@bitbucket.org:pielibs/highlighter.git';
      }

      return bowerDir.cleanLocalInstallLink(_.extend({}, pies, extraComponents), resolutions)
        .then((resolutionReport) => {
          if (!resolutionReport) {
            throw new Error('no resolutionReport');
          }
          return resolutionReport;
        });
    }
  }

  return runBowerInstall(bowerDir)
    .then((resolutionReport) => {
      return readPieProcessors(pies, bowerDir.components())
        .then((processors) => {
          return configureRouter(itemData, resolutionReport, processors);
        });
    });
};