function Router(
  demoDir, 
  itemData, 
  bundle, 
  processor,
  addAccessibilityComponents) {
  "use strict";
  const path = require('path');
  const fs = require('fs-extra');
  const _ = require('lodash');
  const router = require('express').Router();
  const logger = require('../../../log-factory').fileLogger(__filename);
  const serveStream = require('./serve-stream'); 

  router.get(/(.*?)(\.jpeg|\.jpg|\.gif|\.png)/, (req, res, next) => {
    //TODO: we're assuming a url of /demo/* here, but that is set externally so probably can't make that assumption.
    let filePath = path.join(demoDir, req.originalUrl.replace('/demo', ''));
    logger.silly('url: ', req.originalUrl, 'filePath:', filePath);
    let ext = req.params[1].replace('.', '');
    serveStream(res, ext, Promise.resolve(fs.createReadStream(filePath)));
  });

  router.get('/bundle.js', (req, res, next) => {
    serveStream(res, 'js', Promise.resolve(fs.createReadStream(bundle)));
  });

  router.get('/', (req, res, next) => {
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
          js: ['/components/pie-container/container.js', 'bundle.js'],
          css: [],
          model: model,
          markup: itemData.markup
        });
      })
      .catch(next);
  });

  return router;
}

module.exports = Router;
