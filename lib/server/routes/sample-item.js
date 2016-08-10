function Router(dirname, itemData, resolutionReport, processor, eventService) {
  "use strict";
  const path = require('path');
  const fs = require('fs-extra');
  const _ = require('lodash');
  const express = require('express');
  const router = express.Router();
  const logger = require('../../log-factory').fileLogger(__filename);

  function assetsFromPkgMeta(id, pkgMeta) {

    if (!id || !pkgMeta) {
      throw new Error('missing id or pkgMeta');
    }

    logger.silly('pkgMeta name/version: ', pkgMeta.name, pkgMeta.version);

    let emptyAsset = (id) => {
      return { id: id, js: [], css: [], htmlImports: [] };
    };

    if (!pkgMeta.main) {
      logger.error(`${JSON.stringify(id)} - no main defined - can not load any assets`);
      pkgMeta.main = [];
    }


    let main = _.flatten([pkgMeta.main]);

    return _.reduce(main, (a, m) => {
      var ext = path.extname(m);
      logger.silly('[assetsFromPkgMeta] ', pkgMeta.name, ' ext:', ext);
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

  const utils = require('./utils');

  router.get('/', (req, res, next) => {
    eventService.handle({ type: 'launch' }, utils.urlFromReferer(req), 'serve-pie-demo');
    next();
  }, (
    req, res, next) => {

      let assets = _.reduce(resolutionReport.dependencies, (acc, d) => {
        let a = assetsFromPkgMeta(id(d.name, d.version), d);
        logger.silly(`assets: ${d.name}, ${d.version}`, a);
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
      let container = [];
      let frameworkSupportPaths = { js: [] };

      let has = (key) => {
        let found = _.find(reduced.js, (p) => new RegExp(`.*\/${key}\/.*`).test(p));
        return found !== undefined;
      };

      if (angularIds.length > 0 && !has('pie-angular-one-five-support')) {
        frameworkSupportPaths.js.push('/components/pie-angular-one-five-support/index.js');
      }

      if (reactIds.length > 0 && !has('pie-react-support')) {
        frameworkSupportPaths.js.push('/components/pie-react-support/index.js');
      }

      if (!has('pie-container')) {
        container.push('/components/pie-container/container.js');
      }

      logger.silly('reduced: ', reduced);

      let lrs = require('../../services/read-lrs-config')(process.argv);
      processor.clean(itemData.json.components)
        .then((cleaned) => {
          let model = _.extend(itemData.json, { components: cleaned });

          res.render('sample-item/render', {
            serverEndpoints: {
              process: {
                method: 'POST',
                path: '/process/outcomes'
              },
              state: {
                method: 'POST',
                path: '/process/state'
              },
              event: {
                method: 'POST',
                path: '/event'
              }
            },
            lrs: lrs,
            name: dirname,
            js: _.concat(
              reduced.js,
              container,
              frameworkSupportPaths.js,
              ['/js/open-api-container.js']
            ),
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
