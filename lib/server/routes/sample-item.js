function Router(dirname, itemData, resolutionReport) {
  "use strict";
  const path = require('path');
  const _ = require('lodash');
  const express = require('express');
  const router = express.Router();
  const logger = require('../../log-factory').fileLogger(__filename);

  function assetsFromBower(id, bower) {
    
    logger.debug('bower: ', bower);
    if (!id || !bower) {
      throw new Error('missing id or bower');
    }

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
      logger.silly('[assetsFromBower] ext:', ext);
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
  };

  let id = (name, version) => { return { name: name, version: version } };

  let toWebPaths = (a) => {

    let addPath = (p) => {
      return `/bower_components/${a.id.name}/${p}`
    }

    return {
      js: _.map(a.js, addPath),
      css: _.map(a.css, addPath),
      htmlImports: _.map(a.htmlImports, addPath)
    }
  };
  
  router.post('/process', (req, res, next) => {
    res.status(501).json({error: 'todo...'});
  });
  
  router.get('/',  (req, res, next)  => {

    let assets = _.reduce(resolutionReport.dependencies, (acc, d) => {
      logger.debug('build assets: d: ', d.name, d.version);
      let a = assetsFromBower(id(d.name, d.version), d);
      logger.debug('a: ', a);
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
    let frameworkSupportPaths = {js: []};
    
    if (angularIds.length > 0) {
      frameworkSupportPaths.js.push('/components/pie-angular-one-five-support/index.js');
    }

    if (reactIds.length > 0) {
      frameworkSupportPaths.js.push('/components/pie-react-support/index.js');
    }
    
    let asNamed = (name)  => {
      return {name:name};
    };
    
    logger.debug('reduced: ', reduced);
    
    res.render('sample-item/render', {
      processingEndpoints: {
        process: {
          method: 'POST',
          path: '/process'
        }
      },
      name: dirname,
      js: _.concat(reduced.js , [container], frameworkSupportPaths.js),
      css: reduced.css || [],
      htmlImports: reduced.htmlImports || [],
      model: itemData.json,
      markup: itemData.markup
    });
  });

  return router;
}

module.exports = Router;
