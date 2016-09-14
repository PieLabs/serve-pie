const webpack = require('webpack');
const path = require('path');
const _ = require('lodash');

let baseConfig =  {
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
  resolve: {
    extensions: ['', '.js', '.jsx']
  }
};

exports.bundle = (root, entrypoint) => {
  const logger = require('../../log-factory').fileLogger(__filename);
  
  logger.debug('bundle.. root: ', root, 'entrypoint: ', entrypoint);

  var webpack = require("webpack");

  let config = _.extend( {
    context: root,
    entry: './' + path.relative(root, entrypoint),
    output: {filename: 'bundle.js', path: root}
  }, baseConfig);

  config.module.loaders = _.map(config.module.loaders, (l) => {

    l.include = [
      /entry\.js/,
      /node_modules\/corespring-pie-es6-demo/,
      /node_modules\/corespring-multiple-choice-react/
    ];
    return l;
  });

  logger.debug('config', JSON.stringify(config, null, '  '));

  return new Promise((resolve, reject) => {

    let compilationHandler = (err, stats) => {
      if (err){
        return reject(err);
      }

      var jsonStats = stats.toJson();
      
      if (jsonStats.errors.length > 0){
        reject(jsonStats.errors);
      }
      
      if (jsonStats.warnings.length > 0){
        logger.warn(jsonStats.warnings);
      }

      logger.silly('stats', JSON.stringify(jsonStats));
      resolve(path.join(root, config.output.filename));
    }
    //TODO: Look at: https://webpack.github.io/docs/webpack-dev-middleware.html
    webpack(config, compilationHandler);
  });
}