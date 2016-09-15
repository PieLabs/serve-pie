const express = require('express');
const path = require('path');
const readPieProcessors = require('../../services/processor/read-pie-processors');
const ItemData = require('../../item-data');
const NpmDir = require('../../npm/npm-dir');
const jspm = require('../../jspm');
const _ = require('lodash');
const Processor = require('../../services/processor');
const fs = require('fs-extra');
const bundler = require('../../bundler');

module.exports = (opts) => {

  const logger = require('../../log-factory').fileLogger(__filename);

  logger.info('init router...');
  
  let pies = require('../../read-item-dependencies')(opts.root);
  let resolutions = (fs.readJsonSync(opts.root + '/dependencies.json', { throws: false }) || {}).resolutions;
  
  logger.silly('pies:', pies);

  let configureRouter = (itemData, bundle, pieProcessors) => {
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
      bundle,
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

  let npmDir = new NpmDir(opts.root);

  return npmDir.freshInstall(pies)
    .then(() => jspm.install(opts.root))
    .then(() => {
      logger.debug('begin reading pie processors...');
      let p = readPieProcessors(pies, path.join(opts.root, 'node_modules'))
        .then((processors) => {
          return Promise.resolve({bundle: '', processors: processors});
        });
      return p
    })
    .then((data) => configureRouter(itemData, data.bundle, data.processors));
};