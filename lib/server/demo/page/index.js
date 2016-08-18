function Router(demoDir, itemData, resolutionReport, processor) {
  "use strict";
  const path = require('path');
  const fs = require('fs-extra');
  const _ = require('lodash');
  const express = require('express');
  const router = express.Router();
  const logger = require('../../../log-factory').fileLogger(__filename);
  const assetUtils = require('./asset-utils');
  const serveStream = require('./serve-stream'); 

  let id = (name, version) => { return { name: name, version: version }; };

  router.get(/(.*?)(\.jpeg|\.jpg|\.gif|\.png)/, (req, res, next) => {
    //TODO: we're assuming a url of /demo/* here, but that is set externally so probably can't make that assumption.
    let filePath = path.join(demoDir, req.originalUrl.replace('/demo', ''));
    logger.silly('url: ', req.originalUrl, 'filePath:', filePath);
    let ext = req.params[1].replace('.', '');
    serveStream(res, ext, Promise.resolve(fs.createReadStream(filePath)));
  });

  router.get('/', (req, res, next) => {

    let assets = _.reduce(resolutionReport.dependencies, (acc, d) => {
      let a = assetUtils.pkgMetaToAssets(id(d.name, d.version), d);
      logger.debug(`assets: ${d.name}, ${d.version}`,a);
      acc.push(a);
      return acc;
    }, []);

    let addPath = (name, p) => `bower_components/${name}/${p}`;
    let webPaths = assetUtils.mapPaths(assets, addPath);
    let merged = assetUtils.mergeAssets(webPaths);

    let ids = _(itemData.json.components).map('component.name').uniq().value();
    let angularIds = _.filter(ids, (n) => resolutionReport.pieUses(n, 'angular'));
    let reactIds = _.filter(ids, (n) => resolutionReport.pieUses(n, 'react'));
    let container = [];
    let frameworkSupportPaths = { js: [] };

    let has = (key) => {
      let found = _.find(merged.js, (p) => new RegExp(`.*\/${key}\/.*`).test(p));
      return found !== undefined;
    };

    //TODO: /components is serving assets from the main/components dir.
    //should the demo have it's own dedicated components dir?
    if (angularIds.length > 0 && !has('pie-angular-one-five-support')) {
      frameworkSupportPaths.js.push('/components/pie-angular-one-five-support/index.js');
    }

    if (reactIds.length > 0 && !has('pie-react-support')){
      frameworkSupportPaths.js.push('/components/pie-react-support/index.js');
    }

    if(!has('pie-container')){
      container.push('/components/pie-container/container.js');
    }

    logger.silly('merged: ', merged);

    processor.clean(itemData.json.components)
      .then((cleaned) => {
        let model = _.extend(itemData.json, { components: cleaned });

        res.render('demo/index', {
          processingEndpoints: {
            model: {
              method: 'PUT',
              path: '/demo/process/model' 
            }
          },
          name: 'demo',
          js: _.concat(
            merged.js, 
            container, 
            frameworkSupportPaths.js
            ),
          css: merged.css || [],
          htmlImports: merged.htmlImports || [],
          model: model,
          markup: itemData.markup
        });
      })
      .catch(next);
  });

  return router;
}

module.exports = Router;
