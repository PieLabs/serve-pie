const logger = require('../log-factory').fileLogger(__filename);
const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');

exports.createEntryPoint = (root, pies) => {
  logger.debug(`createEntryPoint, root: ${root}, pies: ${pies}`);

  let registerLogic = (value, index) => {
    return `
    // ${value} ${index}
    import comp${index} from '${value}';
    document.registerElement('${value}', comp${index});
    `;
  }
  let js = _(pies).keys().map(registerLogic).value().join('\n');

  let entryPath = path.join(root, 'entry.js');
  fs.writeFileSync(entryPath, js, { encoding: 'utf8' });
  return Promise.resolve(entryPath);
};

let resolveLoaderRoot = path.resolve(path.join(__dirname, '..', '..', 'node_modules'));
logger.info('resolveLoaderRoot', resolveLoaderRoot);

let baseConfig = {
  module: {
    loaders: [
      {
        test: /.js?$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react']
        }
      },
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react']
        }
      },
      {
        test: /\.less$/,
        loader: "style!css!less"
      }
    ]
  },
  resolveLoader: {
    root: resolveLoaderRoot
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  }
};

exports.createMiddleware = (root, pies, entrypoint) => {

  logger.debug('create middleware..');

  const webpack = require("webpack");

  let config = _.extend({
    context: root,
    entry: './' + path.relative(root, entrypoint),
    output: { filename: 'bundle.js', path: root }
  }, baseConfig);

  config.module.loaders = _.map(config.module.loaders, (l) => {

    let entryRegex = new RegExp(path.basename(entrypoint));

    let modulePaths = _.keys(pies).map((k) => {
      return new RegExp('.*node_modules((?!' + k + ').)*$')
    });

    l.exclude = modulePaths;
    return l;
  });

  logger.silly('webpack config', JSON.stringify(config, null, '  '));

  //TODO: Add a flag for this - can be useful for development.
  if (process.env.WRITE_WEBPACK_CONFIG) {
    const writeConfig = require('./webpack-bundler/write-config');
    writeConfig(path.join(root, 'webpack.config.js'), config);
  }

  let compiler = webpack(config);
  let instance = webpackMiddleware(compiler);
  return Promise.resolve(instance);
};
