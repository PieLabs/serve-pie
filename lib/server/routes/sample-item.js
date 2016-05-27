function Router(dirname, itemData, resolutionReport, processor) {
  "use strict";
  const path = require('path');
  const fs = require('fs-extra');
  const _ = require('lodash');
  const express = require('express');
  const router = express.Router();
  const logger = require('../../log-factory').fileLogger(__filename);

  function assetsFromBower(id, bower) {

    if (!id || !bower) {
      throw new Error('missing id or bower');
    }
    
    logger.silly('bower name/version: ', bower.name, bower.version);

    let emptyAsset = (id) => {
      return { id: id, js: [], css: [], htmlImports: [] };
    };

    if (!bower.main) {
      logger.error(`${JSON.stringify(id)} - no main defined - can not load any assets`);
      bower.main = [];
    }


    let main = _.flatten([bower.main]);

    return _.reduce(main, (a, m) => {
      var ext = path.extname(m);
      logger.silly('[assetsFromBower] ', bower.name ,' ext:', ext);
      if (ext === '.js') {
        a.js.push(m);
      }
      else if (ext === '.css') {
        a.css.push(m);
      }
      else if (ext === '.html') {
        a.htmlImports.push(m);
      }
      return a;
    }, emptyAsset(id));
  }

  let id = (name, version) => { return { name: name, version: version }; };

  let toWebPaths = (a) => {

    let addPath = (p) => `/bower_components/${a.id.name}/${p}`;

    return {
      js: _.map(a.js, addPath),
      css: _.map(a.css, addPath),
      htmlImports: _.map(a.htmlImports, addPath)
    };
  };


  function serveStream(res, ext, streamPromise) {

    let mimeTypes = {
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif'
    };

    streamPromise
      .then((s) => {
        logger.debug(`[serveStream] ${ext}`);
        var mimeType = mimeTypes[ext];
        res.header('Content-Type', mimeType);
        res.writeHead(200);
        s.pipe(res);
      })
      .catch((e) => {
        logger.error(`[/:pie/*] err: ${e}`);
        logger.error(e.stack);
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.write(`404 Not Found: \n${e}\n`);
        res.end();
      });
  }


  router.get(/(.*?)(\.jpeg|\.jpg|\.gif|\.png)/, (req, res, next) => {
    let filePath = path.join(process.cwd(), req.originalUrl);
    let ext = req.params[1].replace('.', '');
    serveStream(res, ext, Promise.resolve(fs.createReadStream(filePath)));
  });

  router.get('/', (req, res, next) => {

    let assets = _.reduce(resolutionReport.dependencies, (acc, d) => {
      let a = assetsFromBower(id(d.name, d.version), d);
      logger.debug(`assets: ${d.name}, ${d.version}`,a);
      acc.push(a);
      return acc;
    }, []);

    let webPaths = _.map(assets, toWebPaths);
    let reduced = _.reduce(webPaths, (acc, wp) => {
      acc.js = acc.js.concat(wp.js);
      acc.css = acc.css.concat(wp.css);
      acc.htmlImports = acc.htmlImports.concat(wp.htmlImports);
      return acc;
    }, {
        js: [], css: [], htmlImports: []
      });

    let ids = _(itemData.json.components).map('component.name').uniq().value();
    let angularIds = _.filter(ids, (n) => resolutionReport.pieUses(n, 'angular'));
    let reactIds = _.filter(ids, (n) => resolutionReport.pieUses(n, 'react'));
    let container = '/components/pie-container/container.js';
    let frameworkSupportPaths = { js: [] };

    if (angularIds.length > 0) {
      frameworkSupportPaths.js.push('/components/pie-angular-one-five-support/index.js');
    }

    if (reactIds.length > 0) {
      frameworkSupportPaths.js.push('/components/pie-react-support/index.js');
    }

    let asNamed = (name) => {
      return { name: name };
    };

    logger.debug('reduced: ', reduced);

    processor.clean(itemData.json.components)
      .then((cleaned) => {
        let model = _.extend(itemData.json, { components: cleaned });

        res.render('sample-item/render', {
          processingEndpoints: {
            process: {
              method: 'POST',
              path: '/process/outcomes'
            }
          },
          name: dirname,
          js: _.concat(reduced.js, [container], frameworkSupportPaths.js),
          css: reduced.css || [],
          htmlImports: reduced.htmlImports || [],
          model: model,
          markup: itemData.markup
        });
      })
      .catch(next);
  });

  return router;
}

module.exports = Router;
