module.exports = function Container() {

  'use strict';

  const logFactory = require('./log-factory');
  const Processor = require('./services/processor');
  const _ = require('lodash');
  const ItemData = require('./item-data');

  const readPieProcessors = require('./services/processor/read-pie-processors');

  let logger = logFactory.fileLogger(__filename);

  function startServer(port,
    root,
    itemData,
    resolutionReport,
    pieProcessors,
    logHttpRequests) {
    var App = require('./server');
    var app = new App(
      root,
      itemData,
      resolutionReport,
      new Processor(pieProcessors),
      logHttpRequests);

    var http = require('http');
    app.set('port', port);
    var server = http.createServer(app);
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);

    function onError(error) {
      if (error.syscall !== 'listen') {
        throw error;
      }

      switch (error.code) {
        case 'EADDRINUSE':
          console.error(port + ' is already in use');
          process.exit(1);
          break;
        default:
          throw error;
      }
    }

    function onListening() {
      console.log('Listening on ' + port);
    }
  }

  function loadItem(rootDir, name) {
    return new ItemData(rootDir, name);
  }

  let BowerDir = require('./bower/bower-dir');


  this.run = function (opts) {

    logger.debug('run', opts);
    let itemData = loadItem(opts.root, 'index');
    let componentNames = _.map(itemData.json.components, 'component.name');
    let bowerDir = new BowerDir(opts.root);


    logger.debug(`componentNames: ${componentNames}`);
    let missingDependencies = _.filter(componentNames, (cn) => {
      return opts.pies[cn] === undefined;
    });

    if (missingDependencies.length > 0) {
      throw new Error('missing dependency for: ' + JSON.stringify(missingDependencies));
    }

    logger.debug('[run] dependencies: ', opts.pies);

    if (bowerDir.isInstalled() && !opts.fullInstall) {
      logger.info('already installed - boot the server..');

      logger.debug(`pies: ${opts.pies}`);

      readPieProcessors(opts.pies, bowerDir.components())
        .then((pieProcessors) => {
          startServer(opts.port,
            opts.root,
            itemData,
            bowerDir.resolutionReport(),
            pieProcessors,
            opts.logHttpRequests);
        })
        .catch((err) => {
          console.error(err.stack);
          process.exit(1);
        });
    } else {

      //Add the control-panel as a dependency - all the polymer libs need to load from the same path
      //so the control-panel needs to be loaded from this context too.
      let extraComponents = {};
      extraComponents['control-panel'] = 'git@bitbucket.org:pielibs/control-panel.git';
      extraComponents.masking = 'git@bitbucket.org:pielibs/masking.git';
      extraComponents['popup-glossary'] = 'git@bitbucket.org:pielibs/popup-glossary.git';
      extraComponents.highlighter = 'git@bitbucket.org:pielibs/highlighter.git';
      bowerDir.cleanLocalInstallLink(_.extend({}, opts.pies, extraComponents), opts.resolutions)
        .then((resolutionReport) => {
          if (!resolutionReport) {
            throw new Error('no resolutionReport');
          }

          readPieProcessors(opts.pies, bowerDir.components())
            .then((pieProcessors) => {
              startServer(opts.port,
                opts.root,
                itemData,
                resolutionReport,
                pieProcessors,
                opts.logHttpRequests);
            });
        })
        .catch((e) => {
          console.error(e.stack);
          throw e;
        });

    }

  };

};
