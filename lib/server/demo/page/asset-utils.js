const _ = require('lodash');
const path = require('path');

let emptyAsset = (id) => {
  return { id: id, js: [], css: [], htmlImports: [] };
};

exports.emptyAsset = emptyAsset;

let getLogger = () => require('../../../log-factory').fileLogger(__filename);

exports.mergeAssets = (assetsArray) => {
  return _.reduce(assetsArray, (acc, a) => {
    acc.js = _.compact(acc.js.concat(a.js));
    acc.css = _.compact(acc.css.concat(a.css));
    acc.htmlImports = _.compact(acc.htmlImports.concat(a.htmlImports));
    return acc;
  }, emptyAsset('merged'));
};

exports.mapPath = (asset, fn) => {

  let withName = fn.bind(null, asset.id.name);

  return {
    js: _.map(asset.js, withName),
    css: _.map(asset.css, withName),
    htmlImports: _.map(asset.htmlImports, withName)
  }
};

exports.mapPaths = function(assetsArray, fn) {
 return _.map(assetsArray, (a) => this.mapPath(a, fn));
}

exports.pkgMetaToAssets = (id, pkgMeta) => {

  let logger = getLogger();

  if (!id || !pkgMeta) {
    throw new Error('missing id or pkgMeta');
  }

  logger.silly('pkgMeta name/version: ', pkgMeta.name, pkgMeta.version);

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
};